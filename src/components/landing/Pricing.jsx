import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PricingCard = ({ title, price, features, isPopular, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
        className={`
      relative p-8 rounded-3xl border backdrop-blur-md flex flex-col h-full
      ${isPopular
                ? 'bg-black/40 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.15)] scale-105 z-10'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }
    `}
    >
        {isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
            </div>
        )}

        <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-300 mb-2">{title}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{price}</span>
                <span className="text-slate-500">/mo</span>
            </div>
        </div>

        <ul className="space-y-4 mb-8 flex-1">
            {features.map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className={`p-1 rounded-full ${isPopular ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-slate-400'}`}>
                        <Check size={12} strokeWidth={3} />
                    </div>
                    {feat}
                </li>
            ))}
        </ul>

        <button className={`
      w-full py-4 rounded-xl font-bold text-sm transition-all duration-300
      ${isPopular
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }
    `}>
            Get Started
        </button>
    </motion.div>
);

export default function Pricing() {
    const plans = [
        {
            title: "Starter",
            price: "$0",
            features: ["5 Documents / month", "Basic Chat functionality", "10MB File Limit", "Email Support"],
            delay: 0.1
        },
        {
            title: "Pro",
            price: "$29",
            features: ["Unlimited Documents", "Advanced AI Models (GPT-4)", "100MB File Limit", "Priority Support", "Export to CSV/PDF"],
            isPopular: true,
            delay: 0.2
        },
        {
            title: "Enterprise",
            price: "Custom",
            features: ["Dedicated Server", "Custom AI Fine-tuning", "SLA Guarantee", "24/7 Phone Support", "SSO Integration"],
            delay: 0.3
        }
    ];

    return (
        <section className="py-32 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Pricing</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        No hidden fees. Cancel anytime. Choose the plan that fits your workflow.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
                    {plans.map((p, i) => (
                        <PricingCard key={i} {...p} />
                    ))}
                </div>
            </div>
        </section>
    );
}
