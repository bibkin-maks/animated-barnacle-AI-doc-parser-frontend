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
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    Bold, Italic, Strikethrough, Heading1, Heading2, List,
    Table as TableIcon, Calendar, Columns, Rows, Trash2,
    BarChart2, Download, Plus
} from 'lucide-react';

const MenuBar = ({ editor, onExportCSV, onVisualize }) => {
    if (!editor) {
        return null;
    }

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
              </tbody>
            </table>
        `).run();
    };


    return (
        <div className="flex flex-wrap items-center gap-1 p-2 m-2 mb-0 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg sticky top-2 z-20">
            {/* Basic Formatting */}
            <div className="flex items-center gap-0.5 border-r border-white/10 pr-2 mr-2">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title="Bold"
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title="Italic"
                >
                    <Italic size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded-lg transition-colors ${editor.isActive('strike') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title="Strike"
                >
                    <Strikethrough size={16} />
                </button>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-0.5 border-r border-white/10 pr-2 mr-2">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-1.5 rounded-lg transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title="H1"
                >
                    <Heading1 size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-1.5 rounded-lg transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title="H2"
                >
                    <Heading2 size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title="Bullet List"
                >
                    <List size={16} />
                </button>
            </div>

            {/* Tables */}
            <div className="flex items-center gap-0.5 border-r border-white/10 pr-2 mr-2">
                <button
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    disabled={editor.isActive('table')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Insert Table"
                >
                    <TableIcon size={16} />
                </button>

                <button
                    onClick={insertNotionCalendar}
                    disabled={editor.isActive('table')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Insert Calendar / Tracker"
                >
                    <Calendar size={16} />
                </button>

                <button
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    disabled={!editor.can().addColumnAfter()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
                    title="Add Column"
                >
                    <Columns size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    disabled={!editor.can().addRowAfter()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
                    title="Add Row"
                >
                    <Rows size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    disabled={!editor.can().deleteTable()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30"
                    title="Delete Table"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
                <button
                    onClick={onVisualize}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 border border-emerald-500/20"
                >
                    <BarChart2 size={14} /> Visualize
                </button>
                <button
                    onClick={onExportCSV}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 border border-blue-500/20"
                >
                    <Download size={14} /> CSV
                </button>
            </div>
        </div>
    );
};

const RichTextEditor = ({ content, onChange, onStatsChange, className = "" }) => {
    const [graphData, setGraphData] = useState(null);
    const [showGraphModal, setShowGraphModal] = useState(false);

    const updateStats = useCallback((editor) => {
        let charCount = 0;
        editor.state.doc.descendants((node) => {
            if (node.type.name === 'table') {
                return false;
            }
            if (node.isText) {
                charCount += node.text.length;
            }
            return true;
        });

        if (onStatsChange) {
            onStatsChange(charCount);
        }
    }, [onStatsChange]);

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
        onCreate: ({ editor }) => {
            updateStats(editor);
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
            updateStats(editor);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[calc(100vh-250px)] p-6 md:p-10',
            },
        },
    });

    const parseTableData = useCallback(() => {
        if (!editor) return null;
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

        const headers = Array.from(rows[0].querySelectorAll('th, td')).map(cell => cell.textContent.trim());
        const data = rows.slice(1).map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            const obj = {};
            headers.forEach((header, i) => {
                const cellText = cells[i]?.textContent?.trim();
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
        <div className={`flex flex-col h-full bg-transparent ${className}`}>
            <MenuBar editor={editor} onVisualize={handleVisualize} onExportCSV={handleExportCSV} />
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <EditorContent editor={editor} />
            </div>

            {/* Graph Modal - Disabled for build check */}
            {showGraphModal && graphData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-4xl bg-[#1a1d24] border border-white/10 rounded-2xl p-6 shadow-2xl relative flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <BarChart2 size={20} className="text-cyan-400" /> Data Visualization
                            </h3>
                            <button onClick={() => setShowGraphModal(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>

                        <div className="flex-1 min-h-[300px] flex items-center justify-center text-slate-500">
                            Graphs Temporarily Disabled due to Recharts Build Error
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .ProseMirror {
                     min-height: 100%;
                }
                .ProseMirror table {
                    border-collapse: separate;
                    border-spacing: 0;
                    width: 100%;
                    margin: 1.5em 0;
                    overflow: hidden;
                    table-layout: fixed;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0, 0, 0, 0.2);
                }
                .ProseMirror td, .ProseMirror th {
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 10px;
                    vertical-align: top;
                    box-sizing: border-box;
                    position: relative;
                }
                .ProseMirror th {
                    background-color: rgba(255, 255, 255, 0.05);
                    font-weight: 600;
                    text-align: left;
                    color: #e2e8f0;
                }
                .ProseMirror .selectedCell:after {
                    z-index: 2;
                    position: absolute;
                    content: "";
                    left: 0; right: 0; top: 0; bottom: 0;
                    background: rgba(34, 211, 238, 0.1);
                    pointer-events: none;
                }
                 .ProseMirror ul, .ProseMirror ol {
                    padding-left: 1.5em;
                    list-style-type: disc;
                 }
                 .ProseMirror h1 { font-size: 2.25em; font-weight: 800; margin-bottom: 0.5em; letter-spacing: -0.02em; color: white; }
                 .ProseMirror h2 { font-size: 1.8em; font-weight: 700; margin-bottom: 0.5em; letter-spacing: -0.01em; color: #f1f5f9; }
                 .ProseMirror p { margin-bottom: 0.75em; line-height: 1.7; color: #cbd5e1; }
                 .ProseMirror a { color: #22d3ee; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
                 .ProseMirror a:hover { border-bottom-color: #22d3ee; }
                 
                 /* Scrollbar for editor */
                 .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                 }
                 .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                 }
                 .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                 }
                 .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                 }
            `}</style>
        </div>
    );
};

export default RichTextEditor;

