import React, { useState, useEffect } from "react";
import { bengaluruPoliticians, getMLAsByConstituency } from "../utils/bengaluruPoliticians";

export default function PoliticianSelector({ onSelect }) {
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [selectedMP, setSelectedMP] = useState("");
  const [selectedMLA, setSelectedMLA] = useState("");
  const [mlaOptions, setMlaOptions] = useState([]);

  // Update MLA options when constituency changes
  useEffect(() => {
    if (selectedConstituency) {
      const mlas = getMLAsByConstituency(selectedConstituency);
      setMlaOptions(mlas);
      setSelectedMLA(""); // Reset MLA selection
    } else {
      setMlaOptions([]);
      setSelectedMLA("");
    }
  }, [selectedConstituency]);

  // Update MP when constituency changes
  useEffect(() => {
    if (selectedConstituency) {
      const constituency = bengaluruPoliticians.constituencies.find(
        c => c.id === selectedConstituency
      );
      if (constituency) {
        setSelectedMP(`${constituency.mp.name} (${constituency.mp.party})`);
      }
    } else {
      setSelectedMP("");
    }
  }, [selectedConstituency]);

  // Notify parent component of changes
  useEffect(() => {
    if (onSelect) {
      onSelect({
        constituency: selectedConstituency,
        mp: selectedMP,
        mla: selectedMLA
      });
    }
  }, [selectedConstituency, selectedMP, selectedMLA, onSelect]);

  return (
    <div className="space-y-4">
      {/* Constituency Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Lok Sabha Constituency
        </label>
        <select
          value={selectedConstituency}
          onChange={(e) => setSelectedConstituency(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-amber-500 focus:outline-none"
        >
          <option value="">-- Select a constituency --</option>
          {bengaluruPoliticians.constituencies.map((constituency) => (
            <option key={constituency.id} value={constituency.id}>
              {constituency.name}
            </option>
          ))}
        </select>
      </div>

      {/* MP Display */}
      {selectedMP && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Member of Parliament (MP)
          </label>
          <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 font-medium">
            {selectedMP}
          </div>
        </div>
      )}

      {/* MLA Selector */}
      {mlaOptions.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            State Legislative Assembly (MLA)
          </label>
          <select
            value={selectedMLA}
            onChange={(e) => setSelectedMLA(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-amber-500 focus:outline-none"
          >
            <option value="">-- Select an MLA --</option>
            {mlaOptions.map((mla, index) => (
              <option key={index} value={mla.name}>
                {mla.name} ({mla.assembly})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
