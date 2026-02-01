import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin } from 'lucide-react';

const TeamMember = ({ name, role, gradient, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
        className="group relative"
    >
        <div className={`
      w-32 h-32 mx-auto rounded-full mb-6 
      bg-gradient-to-br ${gradient} 
      p-1 shadow-2xl relative
    `}>
            <div className="w-full h-full bg-[#0f1115] rounded-full flex items-center justify-center relative overflow-hidden group-hover:scale-95 transition-transform duration-500">
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 select-none">
                    {name.split(' ').map(n => n[0]).join('')}
                </span>
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
            </div>

            {/* Orbiting particles */}
            <div className="absolute -inset-2 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
        <p className="text-cyan-400 text-sm font-medium tracking-wide uppercase mb-4">{role}</p>

        <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Github size={18} className="text-slate-400 hover:text-white cursor-pointer transition-colors" />
            <Twitter size={18} className="text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors" />
            <Linkedin size={18} className="text-slate-400 hover:text-blue-500 cursor-pointer transition-colors" />
        </div>
    </motion.div>
);

export default function Team() {
    const members = [
        { name: "Max Kodak", role: "AI Research Lead", gradient: "from-purple-500 to-indigo-500", delay: 0.1 },
        { name: "Sarah Connor", role: "Chief Security Officer", gradient: "from-cyan-500 to-blue-500", delay: 0.2 },
        { name: "Neo Anderson", role: "Frontend Architect", gradient: "from-emerald-500 to-teal-500", delay: 0.3 },
        { name: "Trinity Moss", role: "Product Strategy", gradient: "from-pink-500 to-rose-500", delay: 0.4 },
    ];

    return (
        <section className="py-24 relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Visionaries</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Building the future of document intelligence, one node at a time.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                    {members.map((m, i) => (
                        <TeamMember key={i} {...m} />
                    ))}
                </div>
            </div>
        </section>
    );
}
