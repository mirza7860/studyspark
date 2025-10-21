import React, { useState } from "react";
import { generateSummary } from "../services/geminiService";
import { Loader } from "./Loader";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SummaryViewProps {
  documentText: string;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  heading1: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 20,
    color: "#1F2937",
  },
  heading2: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 16,
    color: "#374151",
  },
  heading3: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 12,
    color: "#4B5563",
  },
  paragraph: {
    fontSize: 11,
    marginBottom: 12,
    lineHeight: 1.6,
    color: "#374151",
  },
  listItem: {
    fontSize: 11,
    marginBottom: 8,
    marginLeft: 20,
    lineHeight: 1.5,
    color: "#374151",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
  },
  tableHeader: {
    fontSize: 11,
    fontWeight: "bold",
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 8,
    flex: 1,
    color: "#1F2937",
  },
  tableCell: {
    fontSize: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flex: 1,
    color: "#374151",
  },
  divider: {
    marginVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  italic: {
    fontStyle: 'italic',
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#f0f0f0',
  },
});

const SummaryPDF: React.FC<{ summary: string }> = ({ summary }) => {
  const parseInline = (text: string) => {
    const parts = text.split(/(\**.*?\**|\*.*?\*|`.*?`)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <Text key={index} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>;
        } else if (part.startsWith('*') && part.endsWith('*')) {
            return <Text key={index} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</Text>;
        } else if (part.startsWith('`') && part.endsWith('`')) {
            return <Text key={index} style={styles.code}>{part.slice(1, -1)}</Text>;
        } else {
            return <Text key={index}>{part}</Text>;
        }
    });
  };

  const parseMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith("# ")) {
        elements.push(
          <Text key={`h1-${i}`} style={styles.heading1}>
            {line.substring(2)}
          </Text>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <Text key={`h2-${i}`} style={styles.heading2}>
            {line.substring(3)}
          </Text>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <Text key={`h3-${i}`} style={styles.heading3}>
            {line.substring(4)}
          </Text>
        );
      } else if (line.startsWith("* ") || line.startsWith("- ")) {
        elements.push(
          <Text key={`li-${i}`} style={styles.listItem}>
            • {parseInline(line.substring(2))}
          </Text>
        );
      } else if (line.match(/^\d+\.\s/)) {
        elements.push(
          <Text key={`ol-${i}`} style={styles.listItem}>
            {parseInline(line)}
          </Text>
        );
      } else if (line.startsWith("| ")) {
        // Simple table parsing
        const tableRows = [];
        while (i < lines.length && lines[i].startsWith("| ")) {
          const cells = lines[i]
            .split("|")
            .map((cell) => cell.trim())
            .filter((cell) => cell && cell !== "");
          tableRows.push(cells);
          i++;
        }
        i--;

        // Skip separator row
        if (tableRows.length > 1 && tableRows[1][0]?.startsWith("-")) {
          tableRows.splice(1, 1);
        }

        elements.push(
          <View key={`table-${i}`} style={{ marginVertical: 12 }}>
            {tableRows.map((row, rowIdx) => (
              <View key={`row-${rowIdx}`} style={styles.tableRow}>
                {row.map((cell, cellIdx) => (
                  <Text
                    key={`cell-${rowIdx}-${cellIdx}`}
                    style={rowIdx === 0 ? styles.tableHeader : styles.tableCell}
                  >
                    {cell}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        );
      } else if (line.startsWith("---")) {
        elements.push(
            <View key={`hr-${i}`} style={styles.divider} />
        );
      } else if (line.trim() === "") {
        elements.push(<View key={`space-${i}`} style={{ height: 4 }} />);
      } else if (line.trim()) {
        elements.push(
            <Text key={`p-${i}`} style={styles.paragraph}>
                {parseInline(line)}
            </Text>
        );
      }

      i++;
    }

    return elements;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {parseMarkdown(summary)}
      </Page>
    </Document>
  );
};


const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => (
          <h1
            className="text-3xl font-bold text-gray-900 mt-6 mb-4"
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className="text-2xl font-bold text-gray-800 mt-5 mb-3"
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="text-xl font-semibold text-gray-700 mt-4 mb-2"
            {...props}
          />
        ),
        p: ({ node, ...props }) => (
          <p className="text-gray-700 mb-4 leading-relaxed" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul
            className="list-disc list-inside mb-4 space-y-2 text-gray-700"
            {...props}
          />
        ),
        ol: ({ node, ...props }) => (
          <ol
            className="list-decimal list-inside mb-4 space-y-2 text-gray-700"
            {...props}
          />
        ),
        li: ({ node, ...props }) => (
          <li className="text-gray-700 ml-2" {...props} />
        ),
        code: ({ node, ...props }) => (
          <code
            className="bg-gray-200 text-gray-900 px-2 py-1 rounded text-sm font-mono"
            {...props}
          />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-gray-400 pl-4 italic text-gray-600 my-4"
            {...props}
          />
        ),
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto mb-4">
            <table
              className="w-full border-collapse border border-gray-300"
              {...props}
            />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gray-200" {...props} />
        ),
        tr: ({ node, ...props }) => (
          <tr className="border border-gray-300" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th
            className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900"
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td
            className="border border-gray-300 px-4 py-2 text-gray-700"
            {...props}
          />
        ),
        b: ({ node, ...props }) => <b>{...props}</b>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export const SummaryView: React.FC<SummaryViewProps> = ({ documentText }) => {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [summaryType, setSummaryType] = useState("short");
  const [fromPage, setFromPage] = useState("");
  const [toPage, setToPage] = useState("");

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setSummary("");
    try {
      const result = await generateSummary(
        documentText,
        summaryType,
        fromPage,
        toPage
      );
      setSummary(result);
    } catch (err) {
      console.error(err);
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    const blob = await pdf(<SummaryPDF summary={summary} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Document Summary
        </h2>

        {/* Summary Type Buttons */}
        <div className="flex items-center gap-3 mb-5">
          {["short", "detailed", "cheatsheet"].map((type) => (
            <button
              key={type}
              onClick={() => setSummaryType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                summaryType === type
                  ? "bg-gray-700 text-white shadow-md"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} Summary
            </button>
          ))}
        </div>

        {/* Page Range & Generate Button */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="From Page"
            value={fromPage}
            onChange={(e) => setFromPage(e.target.value)}
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="text"
            placeholder="To Page"
            value={toPage}
            onChange={(e) => setToPage(e.target.value)}
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="ml-2 bg-gray-700 text-white hover:bg-gray-800 disabled:bg-gray-500 font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-grow flex flex-col p-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center flex-grow gap-4">
            <Loader />
            <p className="text-gray-600 font-medium">
              Distilling the key points for you...
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center flex-grow">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {summary && !isLoading && (
          <div className="flex flex-col flex-grow">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 overflow-y-auto flex-grow mb-6">
              <MarkdownRenderer content={summary} />
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={handleExport}
                className="bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8H3m0 0h18"
                  />
                </svg>
                Export to PDF
              </button>
            </div>
          </div>
        )}

        {!summary && !isLoading && !error && (
          <div className="flex items-center justify-center flex-grow">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 font-medium">
                Generate a summary to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
