import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Custom extension to handle cell background colors if not natively supported easily
// Actually, TextStyle + Color usually works for text. For Cell background, we need a custom attribute.
// For now, let's stick to text color or simple implementation. 
// Note: Tiptap doesn't have a direct "Cell Background" extension in the free tier easily accessible without custom code.
// We will focus on Tables and Graphs primarily.

const MenuBar = ({ editor, onExportCSV, onVisualize, onStatsChange }) => {
    if (!editor) {
        return null;
    }

    const insertCalendar = () => {
        editor.chain().focus()
            .insertTable({ rows: 4, cols: 5, withHeaderRow: true })
            .run();

        // We need to wait for the table to be inserted to populate headers, 
        // but simple chain commands might not allow easy cell content insertion immediately by coordinates.
        // A simpler way is to insert HTML table or just let the user fill it.
        // However, we can try to set content using chain commands if focused.
        // For simplicity providing a structured empty table is often enough, but let's try to label headers.
        // Actually, let's keep it simple: Just a 4x5 table is a "Calendar Grid".
        // Better yet: Insert HTML content for the table.

        // This functionality is complex to structure perfectly via API, but let's try a snippet.
        // editor.chain().focus().insertContent(...)
    };

    const insertNotionCalendar = () => {
        editor.chain().focus().insertContent(`
            <table>
              <tbody>
                <tr>
                  <th><p>Date</p></th>
                  <th><p>Time</p></th>
                  <th><p>Activity</p></th>
                  <th><p>Status</p></th>
                  <th><p>Tags</p></th>
                </tr>
                <tr>
                  <td><p></p></td>
                  <td><p></p></td>
                  <td><p></p></td>
                  <td><p></p></td>
                  <td><p></p></td>
                </tr>
                <tr>
                  <td><p></p></td>
                  <td><p></p></td>
                  <td><p></p></td>
                  <td><p></p></td>
                  <td><p></p></td>
                </tr>
                 <tr>
                  <td><p></p></td>
                  <td><p></p></td>
                  <td><p></p></td>
                  <td><p></p></td>
                  <td><p></p></td>
                </tr>
              </tbody>
            </table>
        `).run();
    };


    return (
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-20">
            {/* Basic Formatting */}
            <div className="flex items-center gap-1 border-r border-white/10 pr-2">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('bold') ? 'text-cyan-400 bg-white/10' : 'text-slate-300'}`}
                    title="Bold"
                >
                    <BIcon />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('italic') ? 'text-cyan-400 bg-white/10' : 'text-slate-300'}`}
                    title="Italic"
                >
                    <IIcon />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('strike') ? 'text-cyan-400 bg-white/10' : 'text-slate-300'}`}
                    title="Strike"
                >
                    <SIcon />
                </button>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-1 border-r border-white/10 pr-2">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 1 }) ? 'text-cyan-400 bg-white/10' : 'text-slate-300'}`}
                    title="H1"
                >
                    <H1Icon />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 2 }) ? 'text-cyan-400 bg-white/10' : 'text-slate-300'}`}
                    title="H2"
                >
                    <H2Icon />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded hover:bg-white/10 ${editor.isActive('bulletList') ? 'text-cyan-400 bg-white/10' : 'text-slate-300'}`}
                    title="Bullet List"
                >
                    <ListIcon />
                </button>
            </div>

            {/* Tables */}
            <div className="flex items-center gap-1 border-r border-white/10 pr-2">
                <button
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    disabled={editor.isActive('table')} // Prevent nested tables
                    className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-slate-300 disabled:cursor-not-allowed"
                    title="Insert Table"
                >
                    <TableIcon />
                </button>

                {/* Notion Calendar Button */}
                <button
                    onClick={insertNotionCalendar}
                    disabled={editor.isActive('table')} // Prevent nested
                    className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-purple-400 disabled:opacity-30 disabled:hover:text-slate-300 disabled:cursor-not-allowed"
                    title="Insert Calendar / Tracker"
                >
                    <CalendarIcon />
                </button>

                <button
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    disabled={!editor.can().addColumnAfter()}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-300 disabled:opacity-30"
                    title="Add Column"
                >
                    <ColPlusIcon />
                </button>
                <button
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    disabled={!editor.can().addRowAfter()}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-300 disabled:opacity-30"
                    title="Add Row"
                >
                    <RowPlusIcon />
                </button>
                <button
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    disabled={!editor.can().deleteTable()}
                    className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-red-400 disabled:opacity-30"
                    title="Delete Table"
                >
                    <TrashIcon />
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
                <button
                    onClick={onVisualize}
                    className="px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold uppercase tracking-wide flex items-center gap-1"
                >
                    <GraphIcon /> Visualize
                </button>
                <button
                    onClick={onExportCSV}
                    className="px-3 py-1.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs font-bold uppercase tracking-wide flex items-center gap-1"
                >
                    <DownloadIcon /> Export CSV
                </button>
            </div>
        </div>
    );
};

const RichTextEditor = ({ content, onChange, onStatsChange, className = "" }) => {
    const [graphData, setGraphData] = useState(null);
    const [showGraphModal, setShowGraphModal] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full',
                },
            }),
            TableRow,
            TableHeader,
            TableCell,
            TextStyle,
            Color,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());

            // Calculate Character Count EXCLUDING tables
            let charCount = 0;
            editor.state.doc.descendants((node) => {
                if (node.type.name === 'table') {
                    return false; // Skip traversing into tables
                }
                if (node.isText) {
                    charCount += node.text.length;
                }
                return true;
            });

            if (onStatsChange) {
                onStatsChange(charCount);
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
    });

    // Helper: Parse the first table found in the editor to JSON for graphs/CSV
    const parseTableData = useCallback(() => {
        if (!editor) return null;

        // This is a naive implementation that grabs the first table
        // A better way would be to get the *selected* table or prompt user
        const html = editor.getHTML();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const table = doc.querySelector('table');

        if (!table) {
            alert("No table found to visualize/export!");
            return null;
        }

        const rows = Array.from(table.querySelectorAll('tr'));
        if (rows.length < 2) return null;

        // Assume first row is headers
        const headers = Array.from(rows[0].querySelectorAll('th, td')).map(cell => cell.textContent.trim());
        const data = rows.slice(1).map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            const obj = {};
            headers.forEach((header, i) => {
                const cellText = cells[i]?.textContent?.trim();
                // Try to convert to number if possible
                const num = parseFloat(cellText);
                obj[header] = isNaN(num) ? cellText : num;
            });
            return obj;
        });

        return { headers, data };
    }, [editor]);

    const handleVisualize = () => {
        const result = parseTableData();
        if (result && result.data.length > 0) {
            setGraphData(result);
            setShowGraphModal(true);
        }
    };

    const handleExportCSV = () => {
        const result = parseTableData();
        if (!result) return;

        const { headers, data } = result;
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => row[header]).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className={`flex flex-col border border-white/10 rounded-xl bg-[#0f1115]/40 backdrop-blur-sm overflow-hidden ${className}`}>
            <MenuBar editor={editor} onVisualize={handleVisualize} onExportCSV={handleExportCSV} />
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent">
                <EditorContent editor={editor} />
            </div>

            {/* Graph Modal */}
            {showGraphModal && graphData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-4xl bg-[#1a1d24] border border-white/10 rounded-2xl p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Data Visualization</h3>
                            <button onClick={() => setShowGraphModal(false)} className="text-slate-400 hover:text-white">Close</button>
                        </div>

                        <div className="flex-1 min-h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graphData.data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey={graphData.headers[0]} stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f1115', border: '1px solid #333' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                    {graphData.headers.slice(1).map((header, index) => (
                                        <Bar
                                            key={header}
                                            dataKey={header}
                                            fill={['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][index % 4]}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Styles for Table (Global or Scoped) */}
            <style>{`
                .ProseMirror {
                     min-height: 100%;
                }
                .ProseMirror table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1em 0;
                    overflow: hidden;
                    table-layout: fixed;
                }
                .ProseMirror td, .ProseMirror th {
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    padding: 8px;
                    vertical-align: top;
                    box-sizing: border-box;
                    position: relative;
                }
                .ProseMirror th {
                    background-color: rgba(255, 255, 255, 0.05);
                    font-weight: bold;
                    text-align: left;
                }
                .ProseMirror .selectedCell:after {
                    z-index: 2;
                    position: absolute;
                    content: "";
                    left: 0; right: 0; top: 0; bottom: 0;
                    background: rgba(33, 150, 243, 0.15);
                    pointer-events: none;
                }
                 .ProseMirror ul, .ProseMirror ol {
                    padding-left: 1.5em;
                    list-style-type: disc;
                 }
                 .ProseMirror h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; }
                 .ProseMirror h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; }
            `}</style>
        </div>
    );
};

// Icons (Simple SVGs)
const BIcon = () => <span className="font-bold">B</span>;
const IIcon = () => <span className="italic">I</span>;
const SIcon = () => <span className="line-through">S</span>;
const H1Icon = () => <span className="text-xs font-bold">H1</span>;
const H2Icon = () => <span className="text-xs font-bold">H2</span>;
const ListIcon = () => <span>•-</span>;
const TableIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
);
const ColPlusIcon = () => <span>+|<span className="text-[10px]">Col</span></span>;
const RowPlusIcon = () => <span>+_<span className="text-[10px]">Row</span></span>;
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);
const GraphIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
    </svg>
);
const DownloadIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

export default RichTextEditor;
