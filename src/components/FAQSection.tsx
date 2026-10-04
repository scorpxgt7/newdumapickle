import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What pickleball gear should I buy as a beginner?",
      answer: "For beginners, we recommend a medium-weight composite or fiberglass paddle (around 7.3 to 7.8 ounces) as it offers a good balance of power and control. Don't forget comfortable court shoes with non-marking soles and a few outdoor or indoor balls depending on where you plan to play."
    },
    {
      question: "How do I book a court in Dumaguete?",
      answer: "You can use our 'Court Directory' to view all public and premium courts in Dumaguete. For public courts, it's usually first-come, first-served. For premium facilities like Helios, you can use the booking link provided on their facility card to reserve a time slot online."
    },
    {
      question: "Where is the Helios facility located and what are its amenities?",
      answer: "The Helios Sports Facility is an indoor, premium pickleball center located just outside the city center. It features professional-grade lighting, well-maintained courts, dedicated parking, and a pro shop. It is highly rated for its clean and spacious environment."
    },
    {
      question: "Is there a local community or group I can join to find games?",
      answer: "Yes! You can use our Matchmaking section to find players of similar skill levels. Additionally, many players connect through the 'DumaPickle' Facebook group and WhatsApp chats where weekly open play schedules are posted."
    },
    {
      question: "What is the difference between indoor and outdoor pickleball balls?",
      answer: "Outdoor balls are slightly heavier, harder, and have smaller holes to resist wind and play faster on abrasive surfaces. Indoor balls are lighter, softer, and have larger holes, offering better control on smooth gym floors."
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 border-t border-gray-100 dark:border-slate-800" id="faq-section">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-brand-50 dark:bg-brand-900/30 rounded-2xl mb-4">
            <HelpCircle className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="mt-4 text-gray-500 dark:text-slate-400">Everything you need to know about gear, courts, and playing in Dumaguete.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-gray-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden transition-all duration-200 hover:border-brand-300 dark:hover:border-brand-700/50 shadow-sm"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-semibold text-gray-900 dark:text-slate-100 pr-4">{faq.question}</span>
                <div className="flex-shrink-0 text-gray-400 dark:text-slate-500">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
