import React from "react";
import Container from "../ui/Container";
import Image from "next/image";

const TrendingDestination = () => {
  return (
    <section className="mt-55">
      <Container>
        <div className="flex justify-center">
          <Image
            src="/icons/Section-feature-header.svg"
            alt="Icon Search"
            width={800}
            height={200}
            className="object-contain"
          />
        </div>
      </Container>
    </section>
  );
};

export default TrendingDestination;
