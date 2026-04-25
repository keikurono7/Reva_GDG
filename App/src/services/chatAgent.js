import { collection, doc, getDoc, getDocs, getFirestore } from "firebase/firestore";
import { app } from "./firebase_";

const db = getFirestore(app);

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.REACT_APP_GEMINI_MODEL || "gemma-4-26b-a4b-it";

const KNOWN_COLLECTIONS = {
  users: {
    description: "User profiles for citizens and politicians.",
  },
  initiatives: {
    description: "Public initiatives posted by politicians.",
  },
  bills: {
    description: "Bills or policy items posted in the app.",
  },
  discussionTopics: {
    description: "Public discussion topics and conversation starters.",
  },
};

const BOOTH_DIRECTORY = [
  {
    boothNumber: "101",
    constituency: "Bengaluru South",
    district: "Bengaluru Urban",
    location: "Government School, Jayanagar",
    totalVoters: 1250,
  },
  {
    boothNumber: "102",
    constituency: "Bengaluru South",
    district: "Bengaluru Urban",
    location: "Community Hall, JP Nagar",
    totalVoters: 980,
  },
  {
    boothNumber: "201",
    constituency: "Mysuru City",
    district: "Mysuru",
    location: "Municipal School, Vijayanagar",
    totalVoters: 1100,
  },
];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isPolitician(user) {
  return (
    user?.userType === "politician" ||
    user?.role === "politician" ||
    Boolean(String(user?.post || "").trim())
  );
}

function getStoredSession() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("Pratinidhi_user") || "null");
  } catch {
    return null;
  }
}

function buildKnownArea(profile) {
  return {
    constituency: profile?.constituency || null,
    district: profile?.district || null,
    booth: profile?.booth || null,
  };
}

function toSerializable(value, depth = 0) {
  if (depth > 3) return "[nested]";
  if (value == null) return value;
  if (typeof value === "string") {
    return value.length > 300 ? `${value.slice(0, 297)}...` : value;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.slice(0, 8).map((item) => toSerializable(item, depth + 1));
  }
  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (typeof value?.toUint8Array === "function") {
    return "[binary]";
  }
  if (value?._byteString || value?.binaryString) {
    return "[binary]";
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 20)
        .map(([key, item]) => [key, toSerializable(item, depth + 1)])
    );
  }
  return String(value);
}

function flattenRecordText(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(flattenRecordText).join(" ");
  }
  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (typeof value === "object") {
    return Object.values(value).map(flattenRecordText).join(" ");
  }
  return "";
}

function inferType(value) {
  if (value == null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value?.toDate === "function") return "timestamp";
  return typeof value;
}

function summarizeRecord(record) {
  return {
    id: record.id,
    ...toSerializable(record),
  };
}

function buildSchemaSummary(records) {
  const fields = {};

  records.forEach((record) => {
    Object.entries(record).forEach(([key, value]) => {
      if (!fields[key]) {
        fields[key] = {
          types: new Set(),
          examples: [],
        };
      }

      fields[key].types.add(inferType(value));
      if (fields[key].examples.length < 3) {
        fields[key].examples.push(toSerializable(value));
      }
    });
  });

  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      {
        types: Array.from(value.types),
        examples: value.examples,
      },
    ])
  );
}

async function readCollection(collectionName) {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

async function getCollectionRecords(collectionName) {
  if (!KNOWN_COLLECTIONS[collectionName]) {
    throw new Error(`Unsupported collection: ${collectionName}`);
  }

  return readCollection(collectionName);
}

function applyFieldFilters(records, fieldFilters) {
  if (!Array.isArray(fieldFilters) || fieldFilters.length === 0) return records;

  return records.filter((record) =>
    fieldFilters.every((filter) => {
      if (!filter?.field) return true;
      const rawValue = record[filter.field];

      if (filter.operator === "equals") {
        return normalize(rawValue) === normalize(filter.value);
      }

      if (filter.operator === "contains") {
        return normalize(rawValue).includes(normalize(filter.value));
      }

      return true;
    })
  );
}

function searchRecords(records, searchText) {
  const searchKey = normalize(searchText);
  if (!searchKey) return records;

  return records.filter((record) =>
    normalize(flattenRecordText(record)).includes(searchKey)
  );
}

async function toolGetUserContext({ context }) {
  return {
    loggedIn: Boolean(context?.session),
    session: context?.session ? toSerializable(context.session) : null,
    profile: context?.profile ? toSerializable(context.profile) : null,
    knownArea: context?.knownArea || null,
  };
}

async function toolListAvailableDataSources() {
  const sources = await Promise.all(
    Object.entries(KNOWN_COLLECTIONS).map(async ([name, meta]) => {
      try {
        const records = await getCollectionRecords(name);
        return {
          collection: name,
          description: meta.description,
          recordCount: records.length,
          sampleFields: Object.keys(buildSchemaSummary(records.slice(0, 5))),
        };
      } catch (error) {
        return {
          collection: name,
          description: meta.description,
          error: error.message,
        };
      }
    })
  );

  return {
    collections: sources,
    extraSources: ["booth_directory"],
  };
}

async function toolInspectCollectionSchema({ collection_name }) {
  const records = await getCollectionRecords(collection_name);
  const sample = records.slice(0, 6);

  return {
    collection: collection_name,
    recordCount: records.length,
    schema: buildSchemaSummary(sample),
    sampleRecords: sample.slice(0, 3).map(summarizeRecord),
  };
}

async function toolQueryRecords({
  collection_name,
  search_text,
  field_filters = [],
  max_results = 5,
  only_politicians = false,
}) {
  let records = await getCollectionRecords(collection_name);

  if (collection_name === "users" && only_politicians) {
    records = records.filter(isPolitician);
  }

  const filtered = applyFieldFilters(records, field_filters);
  const searched = searchRecords(filtered, search_text);

  return {
    collection: collection_name,
    totalMatches: searched.length,
    records: searched.slice(0, Math.min(max_results || 5, 10)).map(summarizeRecord),
  };
}

async function toolGetRecordDetails({ collection_name, record_id }) {
  const snap = await getDoc(doc(db, collection_name, record_id));

  if (!snap.exists()) {
    return {
      found: false,
      collection: collection_name,
      recordId: record_id,
    };
  }

  return {
    found: true,
    collection: collection_name,
    record: summarizeRecord({ id: snap.id, ...snap.data() }),
  };
}

async function toolFindPoliticiansByArea({
  constituency = "",
  district = "",
  max_results = 5,
}) {
  const users = await getCollectionRecords("users");
  const politicians = users.filter(isPolitician);
  const constituencyKey = normalize(constituency);
  const districtKey = normalize(district);

  const results = politicians.filter((person) => {
    const personConstituency = normalize(person.constituency);
    const personDistrict = normalize(person.district);

    if (constituencyKey) {
      return (
        personConstituency === constituencyKey ||
        personConstituency.includes(constituencyKey) ||
        constituencyKey.includes(personConstituency)
      );
    }

    if (districtKey) {
      return (
        personDistrict === districtKey ||
        personDistrict.includes(districtKey) ||
        personConstituency.includes(districtKey)
      );
    }

    return false;
  });

  return {
    totalMatches: results.length,
    records: results.slice(0, Math.min(max_results || 5, 10)).map(summarizeRecord),
  };
}

async function toolGetBoothInfo({ booth_number }) {
  const booth = BOOTH_DIRECTORY.find((item) => item.boothNumber === String(booth_number || ""));
  return booth
    ? { found: true, booth }
    : { found: false, boothNumber: String(booth_number || "") };
}

const TOOL_EXECUTORS = {
  get_user_context: toolGetUserContext,
  list_available_data_sources: toolListAvailableDataSources,
  inspect_collection_schema: toolInspectCollectionSchema,
  query_records: toolQueryRecords,
  get_record_details: toolGetRecordDetails,
  find_politicians_by_area: toolFindPoliticiansByArea,
  get_booth_info: toolGetBoothInfo,
};

const FUNCTION_DECLARATIONS = [
  {
    name: "get_user_context",
    description:
      "Get the logged-in user's saved profile and known area such as constituency, district, and booth.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "list_available_data_sources",
    description:
      "List app data sources and collections you can inspect before deciding what to query.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "inspect_collection_schema",
    description:
      "Inspect the current fields and sample documents in a collection so the assistant can adapt if the database shape changes.",
    parameters: {
      type: "object",
      properties: {
        collection_name: {
          type: "string",
          enum: Object.keys(KNOWN_COLLECTIONS),
          description: "The collection to inspect.",
        },
      },
      required: ["collection_name"],
    },
  },
  {
    name: "query_records",
    description:
      "Search records in a collection using free-text search and optional field filters. Use this for broad, changing database queries.",
    parameters: {
      type: "object",
      properties: {
        collection_name: {
          type: "string",
          enum: Object.keys(KNOWN_COLLECTIONS),
          description: "The collection to query.",
        },
        search_text: {
          type: "string",
          description: "Free-text search over all visible fields.",
        },
        field_filters: {
          type: "array",
          description: "Optional field filters to narrow results.",
          items: {
            type: "object",
            properties: {
              field: { type: "string" },
              operator: {
                type: "string",
                enum: ["equals", "contains"],
              },
              value: { type: "string" },
            },
            required: ["field", "operator", "value"],
          },
        },
        max_results: {
          type: "integer",
          description: "Maximum number of records to return, capped by the app.",
        },
        only_politicians: {
          type: "boolean",
          description: "If querying users, return only politician-like profiles.",
        },
      },
      required: ["collection_name"],
    },
  },
  {
    name: "get_record_details",
    description: "Fetch one full record by its collection name and record id.",
    parameters: {
      type: "object",
      properties: {
        collection_name: {
          type: "string",
          enum: Object.keys(KNOWN_COLLECTIONS),
          description: "The collection containing the record.",
        },
        record_id: {
          type: "string",
          description: "The Firestore document id.",
        },
      },
      required: ["collection_name", "record_id"],
    },
  },
  {
    name: "find_politicians_by_area",
    description:
      "Find politician profiles by constituency or district when the user asks who represents an area.",
    parameters: {
      type: "object",
      properties: {
        constituency: {
          type: "string",
          description: "Constituency name, if known.",
        },
        district: {
          type: "string",
          description: "District name, if known.",
        },
        max_results: {
          type: "integer",
          description: "Maximum number of politician records to return.",
        },
      },
    },
  },
  {
    name: "get_booth_info",
    description: "Look up booth details from the local booth directory by booth number.",
    parameters: {
      type: "object",
      properties: {
        booth_number: {
          type: "string",
          description: "Polling booth number like 101.",
        },
      },
      required: ["booth_number"],
    },
  },
];

function buildSystemInstruction(context, memory) {
  const knownArea = context?.knownArea || {};

  return `
You are Civic Agent inside the Pratinidhi React app.

Your job:
- Help users by reasoning about their question.
- Use tools whenever the answer depends on app data.
- Inspect schemas first if the request is ambiguous or if the database shape might have changed.
- Prefer querying real data over guessing.
- Ask a short follow-up only when a required value is missing.

App data you may access:
- users: citizen and politician profiles
- initiatives: politician initiatives
- bills: bills or policy items
- discussionTopics: public discussion topics
- booth_directory: local booth lookup via tool

Important limits:
- You are running inside a browser-based app.
- You can use tool calls to inspect and query app data.
- You cannot run arbitrary OS shell commands or control the developer machine from this frontend.
- If a user asks for something outside app access, explain the limit clearly and offer the closest in-app action.

Current user context:
${JSON.stringify(
  {
    loggedIn: Boolean(context?.session),
    knownArea,
    profileName: context?.profile?.name || null,
    profileRole: context?.profile?.userType || context?.profile?.role || null,
  },
  null,
  2
)}

Conversation memory:
${JSON.stringify(
  {
    pendingAction: memory?.pendingAction || null,
    lastResultType: memory?.lastResultType || null,
    lastResultCount: Array.isArray(memory?.lastResults) ? memory.lastResults.length : 0,
    lastArea: memory?.lastArea || null,
    selectedEntityId: memory?.selectedEntity?.id || null,
  },
  null,
  2
)}

Response style:
- Be concise and practical.
- Default to 1-2 short sentences unless the user explicitly asks for details.
- Use bullets only when listing results.
- If you used tools, summarize what you found instead of dumping raw JSON.
- If the user asks about "my constituency" and you do not know it, ask for the constituency name.
- Never reveal internal reasoning or planning.
- Never include sections like "Plan", "Reasoning", "Thought process", or "The user said".
- For greetings or casual chat, reply briefly and naturally.
- Do not proactively describe capabilities unless the user explicitly asks.
- Do not restate every option unless the user asks for a full comparison.
`.trim();
}

function mapHistoryToGeminiContents(history) {
  return history
    .filter((message) => message?.text)
    .slice(-8)
    .map((message) => ({
      role: message.role === "bot" ? "model" : "user",
      parts: [{ text: message.text }],
    }));
}

async function callGemini({
  contents,
  systemInstruction,
  useTools = true,
  maxOutputTokens = 180,
  temperature = 0.3,
}) {
  const payload = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  };

  if (useTools) {
    payload.tools = [
      {
        functionDeclarations: FUNCTION_DECLARATIONS,
      },
    ];
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Gemini request failed.");
  }

  return data;
}

function getFunctionCalls(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts
    .filter((part) => part.functionCall)
    .map((part) => part.functionCall);
}

function getTextResponse(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .filter((part) => typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();

  return text || "I could not generate a response for that.";
}

function sanitizeAssistantReply(text) {
  let cleaned = String(text || "").trim();

  cleaned = cleaned.replace(/^the user said[\s\S]*?(?=\n\n|$)/i, "").trim();
  cleaned = cleaned.replace(/^plan:\s*[\s\S]*?(?=\n\n|$)/i, "").trim();
  cleaned = cleaned.replace(/^reasoning:\s*[\s\S]*?(?=\n\n|$)/i, "").trim();
  cleaned = cleaned.replace(/^the user\s+(is asking|asked|wants|said)[\s\S]*?(?=\n\n|$)/i, "").trim();
  cleaned = cleaned.replace(/^i\s+(should|will|need to|can)\s+[\s\S]*?(?=\n\n|$)/i, "").trim();
  cleaned = cleaned.replace(/^i\s+don'?t\s+have\s+personal\s+opinions[^.]*\.\s*/i, "").trim();
  cleaned = cleaned.replace(/^deciding[^.]*depends[^.]*\.\s*/i, "").trim();
  cleaned = cleaned.replace(/^here are the current active initiatives[^:]*:\s*/i, "").trim();

  const planningBullets = /^(?:\d+\.\s.*|[-*]\s.*)(?:\n(?:\d+\.\s.*|[-*]\s.*))+/i;
  cleaned = cleaned.replace(planningBullets, "").trim();

  // Drop leading meta-analysis lines if they still leak through.
  const lines = cleaned.split("\n");
  const isMetaLine = (line) =>
    /^\s*(the user\b|user\b|plan\b|steps?\b|reasoning\b|analysis\b|thinking\b|i should\b|i will\b|i need to\b)/i.test(
      line
    );
  while (lines.length && isMetaLine(lines[0])) {
    lines.shift();
  }
  cleaned = lines.join("\n").trim();

  // Keep replies short and focused by default.
  if (cleaned.length > 420) {
    const firstParagraph = cleaned.split(/\n\n/)[0]?.trim() || "";
    if (firstParagraph) cleaned = firstParagraph;
  }

  return cleaned || "Hi! What can I help you with?";
}

function isSmallTalk(text) {
  return /^(hi|hey|heyy|hello|yo|thanks|thank you|ok|okay|cool|nice)\b/i.test(
    String(text || "").trim()
  );
}

function inferCollectionFromQuestion(text) {
  const t = normalize(text);

  if (/\bbooth\b/.test(t)) return "booth_directory";
  if (/\bbill|policy|act\b/.test(t)) return "bills";
  if (/\binitiative|project|scheme\b/.test(t)) return "initiatives";
  if (/\bpolitician|minister|mla|representative|leader\b/.test(t)) return "users";
  if (/\bdiscussion|topic|debate|chat\b/.test(t)) return "discussionTopics";

  return null;
}

function shouldForceContextFetch(text) {
  const t = normalize(text);
  if (!t || isSmallTalk(t)) return false;

  // For normal questions, fetch grounding context first.
  return /\?|\b(what|which|who|why|how|best|better|recommend|should|find|show|tell|give|compare)\b/.test(
    t
  );
}

async function buildFallbackToolExecutions({ text, context }) {
  const executions = [];

  const userContext = await toolGetUserContext({ context });
  executions.push({ tool: "get_user_context", args: {}, result: userContext });

  const collectionName = inferCollectionFromQuestion(text);
  const boothMatch = String(text || "").match(/\bbooth\s*(\d{2,4})\b/i);

  if (boothMatch?.[1]) {
    const boothResult = await toolGetBoothInfo({ booth_number: boothMatch[1] });
    executions.push({
      tool: "get_booth_info",
      args: { booth_number: boothMatch[1] },
      result: boothResult,
    });
    return executions;
  }

  if (collectionName && collectionName !== "booth_directory") {
    const queryArgs = {
      collection_name: collectionName,
      search_text: text,
      max_results: 6,
      ...(collectionName === "users" ? { only_politicians: true } : {}),
    };

    const queryResult = await toolQueryRecords(queryArgs);
    executions.push({ tool: "query_records", args: queryArgs, result: queryResult });

    if (
      collectionName === "users" &&
      !queryResult?.totalMatches &&
      (context?.knownArea?.constituency || context?.knownArea?.district)
    ) {
      const areaArgs = {
        constituency: context.knownArea.constituency || "",
        district: context.knownArea.district || "",
        max_results: 6,
      };
      const areaResult = await toolFindPoliticiansByArea(areaArgs);
      executions.push({ tool: "find_politicians_by_area", args: areaArgs, result: areaResult });
    }

    return executions;
  }

  // Generic fallback when intent is unclear.
  const sources = await toolListAvailableDataSources();
  executions.push({ tool: "list_available_data_sources", args: {}, result: sources });

  return executions;
}

function compactToolResult(result) {
  if (!result || typeof result !== "object") return result;

  const compact = { ...toSerializable(result) };

  if (Array.isArray(compact.records)) {
    compact.records = compact.records.slice(0, 5);
  }

  if (Array.isArray(compact.sampleRecords)) {
    compact.sampleRecords = compact.sampleRecords.slice(0, 3);
  }

  return compact;
}

function buildSynthesisInstruction() {
  return `
You are a civic assistant writing the FINAL user-facing answer.

Rules:
- Use the provided tool results as your source of truth.
- Give a direct answer first.
- Be concise: usually 1-3 short sentences.
- Only include key facts needed for this exact question.
- If data is missing, say that briefly and ask one specific follow-up.
- Do not output internal reasoning, plans, tool names, or JSON.
- Do not list all options unless the user asked for a full comparison.
- Do not mention phrases like "the user", "the question", "I should", "plan", or "reasoning".
- Return only the final answer text, with no headings or labels.
`.trim();
}

async function synthesizeFinalAnswer({ userText, draftReply, toolExecutions }) {
  const synthesisInput = {
    userQuestion: userText,
    draftAssistantReply: draftReply || "",
    toolExecutions: toolExecutions.map((item) => ({
      tool: item.tool,
      args: toSerializable(item.args || {}),
      result: compactToolResult(item.result),
    })),
  };

  const data = await callGemini({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Create the final answer for the user from this context:\n${JSON.stringify(
              synthesisInput,
              null,
              2
            )}`,
          },
        ],
      },
    ],
    systemInstruction: buildSynthesisInstruction(),
    useTools: false,
    maxOutputTokens: 160,
    temperature: 0.2,
  });

  return sanitizeAssistantReply(getTextResponse(data));
}

async function executeTool(functionCall, context) {
  const tool = TOOL_EXECUTORS[functionCall.name];
  if (!tool) {
    return {
      error: `Unknown tool: ${functionCall.name}`,
    };
  }

  try {
    return await tool({
      ...(functionCall.args || {}),
      context,
    });
  } catch (error) {
    return {
      error: error?.message || "Tool execution failed.",
    };
  }
}

function updateMemoryFromTool(memory, toolName, result, args) {
  const next = { ...memory };

  if (toolName === "find_politicians_by_area") {
    next.lastResults = result?.records || [];
    next.lastResultType = "politicians";
    next.lastArea = args?.constituency || args?.district || null;
    next.pendingAction =
      result?.records?.length || args?.constituency || args?.district
        ? null
        : { type: "needs_area" };
  }

  if (toolName === "query_records") {
    next.lastResults = result?.records || [];
    next.lastResultType = args?.collection_name || "records";
    next.pendingAction = null;
  }

  if (toolName === "get_record_details" && result?.record) {
    next.selectedEntity = result.record;
    next.lastResultType = args?.collection_name || next.lastResultType;
  }

  if (toolName === "get_booth_info" && result?.booth) {
    next.selectedEntity = result.booth;
    next.lastResultType = "booth";
    next.pendingAction = null;
  }

  return next;
}

async function runGeminiToolLoop({ text, context, memory, history }) {
  const contents = [
    ...mapHistoryToGeminiContents(history),
    {
      role: "user",
      parts: [{ text }],
    },
  ];

  let workingMemory = { ...memory };
  const toolTrace = [];
  const toolExecutions = [];

  for (let iteration = 0; iteration < 6; iteration += 1) {
    const data = await callGemini({
      contents,
      systemInstruction: buildSystemInstruction(context, workingMemory),
    });

    const functionCalls = getFunctionCalls(data);

    if (!functionCalls.length) {
      if (!toolExecutions.length && shouldForceContextFetch(text)) {
        const fallbackExecutions = await buildFallbackToolExecutions({ text, context });

        for (const execution of fallbackExecutions) {
          toolTrace.push({
            tool: execution.tool,
            args: execution.args || {},
          });
          toolExecutions.push(execution);
          workingMemory = updateMemoryFromTool(
            workingMemory,
            execution.tool,
            execution.result,
            execution.args || {}
          );
        }
      }

      const draftReply = getTextResponse(data);
      const replyText = toolExecutions.length
        ? await synthesizeFinalAnswer({
            userText: text,
            draftReply,
            toolExecutions,
          })
        : sanitizeAssistantReply(draftReply);

      return {
        reply: replyText,
        memory: {
          ...workingMemory,
          pendingAction: /need .*constituency|which constituency|tell me the constituency/i.test(
            replyText
          )
            ? { type: "needs_area" }
            : workingMemory.pendingAction || null,
        },
        meta: {
          provider: "gemini",
          model: GEMINI_MODEL,
          toolTrace,
        },
      };
    }

    contents.push(data.candidates[0].content);

    for (const functionCall of functionCalls) {
      const toolResult = await executeTool(functionCall, context);
      toolTrace.push({
        tool: functionCall.name,
        args: functionCall.args || {},
      });
      toolExecutions.push({
        tool: functionCall.name,
        args: functionCall.args || {},
        result: toolResult,
      });

      workingMemory = updateMemoryFromTool(
        workingMemory,
        functionCall.name,
        toolResult,
        functionCall.args || {}
      );

      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name: functionCall.name,
              response: toolResult,
              ...(functionCall.id ? { id: functionCall.id } : {}),
            },
          },
        ],
      });
    }
  }

  throw new Error("Gemini agent exceeded the maximum tool loop depth.");
}

function buildNoKeyReply(context) {
  const line = context?.knownArea?.constituency
    ? `I can already see your saved constituency is ${context.knownArea.constituency}.`
    : "I do not see a saved constituency yet.";

  return [
    "Gemini API is not configured yet.",
    line,
    "",
    "Add `REACT_APP_GEMINI_API_KEY=your_key` to `App/.env` and restart the app.",
    "Set `REACT_APP_GEMINI_MODEL=gemma-4-26b-a4b-it` or whatever Gemini API model string you want to use.",
  ].join("\n");
}

export async function loadAgentContext() {
  const session = getStoredSession();
  if (!session?.id) {
    return {
      session: null,
      profile: null,
      knownArea: { constituency: null, district: null, booth: null },
      llmConfigured: Boolean(GEMINI_API_KEY),
      llmModel: GEMINI_MODEL,
      llmProvider: "gemini",
      llmToolCalling: true,
    };
  }

  try {
    const snap = await getDoc(doc(db, "users", session.id));
    const profile = snap.exists() ? { id: snap.id, ...snap.data() } : session;

    return {
      session,
      profile,
      knownArea: buildKnownArea(profile),
      llmConfigured: Boolean(GEMINI_API_KEY),
      llmModel: GEMINI_MODEL,
      llmProvider: "gemini",
      llmToolCalling: true,
    };
  } catch {
    return {
      session,
      profile: session,
      knownArea: buildKnownArea(session),
      llmConfigured: Boolean(GEMINI_API_KEY),
      llmModel: GEMINI_MODEL,
      llmProvider: "gemini",
      llmToolCalling: true,
    };
  }
}

export async function runAgentTurn({ text, context, memory, history = [] }) {
  const trimmed = text.trim();

  if (!trimmed) {
    return {
      reply: "Please type a question so I can help.",
      memory,
      meta: { tool: "none" },
    };
  }

  if (!GEMINI_API_KEY) {
    return {
      reply: buildNoKeyReply(context),
      memory,
      meta: {
        provider: "none",
        model: null,
        toolTrace: [],
      },
    };
  }

  if (/run command|terminal|powershell|cmd|shell command/i.test(trimmed)) {
    return {
      reply:
        "I can use Gemini to inspect and query app data, but this browser assistant cannot run arbitrary machine shell commands. If you want, ask for an in-app data action instead, like querying politicians, bills, initiatives, discussions, or booth info.",
      memory,
      meta: {
        provider: "gemini",
        model: GEMINI_MODEL,
        toolTrace: [],
      },
    };
  }

  return runGeminiToolLoop({
    text: trimmed,
    context,
    memory,
    history,
  });
}
