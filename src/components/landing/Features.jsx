import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Cpu, MessageSquare, Zap, Shield, Globe } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay }}
        viewport={{ once: true }}
        className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 group"
    >
        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-7 h-7 text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
);

export default function Features() {
    const features = [
        {
            icon: Upload,
            title: "Universal Upload",
            description: "Drag & drop PDFs, Word docs, or text files. We handle parsing efficiently so you can focus on insights.",
            delay: 0.1
        },
        {
            icon: Cpu,
            title: "AI Analysis",
            description: "Our advanced models read and understand your documents instantly, extracting key data points and summaries.",
            delay: 0.2
        },
        {
            icon: MessageSquare,
            title: "Natural Chat",
            description: "Ask questions in plain English. Get answers powered by context-aware AI that cites strictly from your files.",
            delay: 0.3
        }
    ];

    return (
        <section className="py-24 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        How <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ChatDoc Works</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Transform your static documents into interactive knowledge bases in seconds.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <FeatureCard key={i} {...f} />
                    ))}
                </div>
            </div>
        </section>
    );
}
