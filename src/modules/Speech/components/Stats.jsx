import React from 'react';

const Stats = () => {
  const stats = [
    {
      number: "95%",
      label: "Accuracy Rate",
      description: "Clinically validated analysis"
    },
    {
      number: "2min",
      label: "Processing Time",
      description: "From upload to results"
    },
    {
      number: "10k+",
      label: "Analyses Done",
      description: "Trusted by professionals"
    },
    {
      number: "24/7",
      label: "Availability",
      description: "Always ready to help"
    }
  ];

  return (
    <section className="py-20 bg-neutral-900">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-neutral-300 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-neutral-500">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;