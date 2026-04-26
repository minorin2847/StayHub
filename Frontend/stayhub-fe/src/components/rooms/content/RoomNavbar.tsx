import { useState } from "react";

export default function RoomNavbar({ sections }: { sections: string[] }) {
  const [activeSection, setActiveSection] = useState(sections[0].toLowerCase());

  return (
    // top-0 will stick it to the very top of the screen
    <nav className="sticky top-0 bg-white z-[100] flex gap-[24px] font-normal text-[20px] h-[60px] w-full border-b border-b-gray-300">
      {sections.map((item, index) => {
        const id = item.toLowerCase();
        return (
          <a
            key={index}
            href={`#${id}`}
            onClick={() => setActiveSection(id)}
            className={`flex h-full items-center transition-all ${
              activeSection === id 
                ? "border-b-2 text-blue-500 border-b-blue-500 font-semibold" 
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {item}
          </a>
        );
      })}
    </nav>
  );
}