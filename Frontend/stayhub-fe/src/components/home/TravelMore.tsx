import React from "react";
import Container from "../ui/Container";

const data = [
  {
    title: "10% discounts on stays",
    desc: "Enjoy discounts at participating properties worldwide crowd",
  },
  {
    title: "Travel of season",
    desc: "Avoid peak times and enjoy lower and fewer crowds",
  },
  {
    title: "Exclusive deals",
    desc: "Enjoy discounts at participating properties worldwide",
  },
  {
    title: "Weekend Special",
    desc: "Enjoy 12% off weekend stays",
  },
];
const TravelMore = () => {
  return (
    <section className="pt-[32px]">
      <Container>
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Travel more, spend less</h2>
          <div className="grid grid-cols-4 gap-6">
            {data.map((item,index)=>(
              <div className="border-[#0057FF] border-[2px] rounded-2xl px-[18px] py-[20px]" key={index}>
                <h3 className="font-bold text-lg text-neutral-900">
                  {item.title}
                </h3>
                <p className="text-neutral-700 text-sm font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TravelMore;
