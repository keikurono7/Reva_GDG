import React, { useState, useEffect } from "react";

const AdminPage = () => {
  const [type, setType] = useState("single_choice");
  const [text, setText] = useState("");
  const [canSkip, setCanSkip] = useState(false);
  const [maxSelections, setMaxSelections] = useState(1);
  const [options, setOptions] = useState([{ label: "", icon: "" }]);
  const [order, setOrder] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    // Fetch total number of questions to suggest max order
    const fetchQuestions = async () => {
      try {
        const res = await fetch("http://localhost:8000/questions");
        const data = await res.json();
        setTotalQuestions(data.length);
        setOrder(data.length); // Default to end of the list
      } catch (err) {
        console.error("Failed to fetch questions", err);
      }
    };
    fetchQuestions();
  }, []);

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { label: "", icon: "" }]);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      type,
      text,
      canSkip,
      options,
      order,
      ...(type === "multi_choice" && { maxSelections: maxSelections || 1 }),
    };

    try {
      const res = await fetch("http://localhost:8000/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Question submitted!");
        setType("single_choice");
        setText("");
        setCanSkip(false);
        setMaxSelections(1);
        setOptions([{ label: "", icon: "" }]);
        setOrder(totalQuestions + 1);
      } else {
        alert("Submission failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow space-y-6">
        <h1 className="text-2xl font-bold text-center">🛠️ Admin Panel</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Question Type</label>
            <select
              className="w-full border p-2 rounded"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="single_choice">Single Choice</option>
              <option value="multi_choice">Multi Choice</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Question Text</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={canSkip}
              onChange={(e) => setCanSkip(e.target.checked)}
            />
            <label>Can Skip</label>
          </div>

          {type === "multi_choice" && (
            <div>
              <label className="block font-medium mb-1">Max Selections</label>
              <input
                type="number"
                min={1}
                max={options.length}
                className="w-full border p-2 rounded"
                value={maxSelections}
                onChange={(e) => setMaxSelections(parseInt(e.target.value))}
              />
            </div>
          )}

          <div>
            <label className="block font-medium mb-1">Insert Position (Order)</label>
            <input
              type="number"
              min={0}
              max={totalQuestions}
              className="w-full border p-2 rounded"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Options</label>
            {options.map((opt, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Label"
                  className="flex-1 border p-2 rounded"
                  value={opt.label}
                  onChange={(e) =>
                    handleOptionChange(index, "label", e.target.value)
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Icon (e.g., fas fa-book)"
                  className="flex-1 border p-2 rounded"
                  value={opt.icon}
                  onChange={(e) =>
                    handleOptionChange(index, "icon", e.target.value)
                  }
                />
                {options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              + Add Option
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Save Question
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;
