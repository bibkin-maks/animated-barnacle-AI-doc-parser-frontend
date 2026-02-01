import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, FileCheck, ChevronDown, Award } from 'lucide-react';

const AccordionItem = ({ question, answer, i }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/10 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-6 text-left focus:outline-none group"
            >
                <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-cyan-400' : 'text-slate-200 group-hover:text-white'}`}>
                    {question}
                </span>
                <ChevronDown
                    className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-400' : 'group-hover:text-white'}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-slate-400 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function Trust() {
    const faqs = [
        { question: "Is my data secure?", answer: "Absolutely. We use AES-256 encryption at rest and TLS 1.3 in transit. Your documents are processed in ephemeral containers and are never used to train our public models without explicit consent." },
        { question: "What file formats do you support?", answer: "Currently we support PDF, DOCX, TXT, MD, and CSV. We are actively working on adding support for Excel spreadsheets and PowerPoint presentations." },
        { question: "Can I cancel my subscription?", answer: "Yes, you can cancel anytime from your account settings. You will retain access until the end of your complete billing cycle." },
    ];

    return (
        <section className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Trust Badges */}
                <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
                            Enterprise-Grade <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Security & Privacy</span>
                        </h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl h-fit"><Shield className="text-blue-400" /></div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">SOC 2 Compliant</h4>
                                    <p className="text-slate-400 text-sm">Our infrastructure adheres to the highest standards of data security and operational integrity.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-xl h-fit"><Lock className="text-indigo-400" /></div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">End-to-End Encryption</h4>
                                    <p className="text-slate-400 text-sm">Your files are encrypted before they even leave your device.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-3 bg-cyan-500/10 rounded-xl h-fit"><Award className="text-cyan-400" /></div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">99.9% Uptime SLA</h4>
                                    <p className="text-slate-400 text-sm">Reliability you can build your business on.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* FAQ */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#0f1115]/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                    >
                        <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
                        <div className="divide-y divide-white/10">
                            {faqs.map((faq, i) => (
                                <AccordionItem key={i} {...faq} i={i} />
                            ))}
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
