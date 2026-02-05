import React, { useEffect, useState } from 'react'
import Container from '../ui/Container'
import Image from 'next/image';

type Sight = {
  id: number;
  name: string;
  flag_icon: string;
  image: string;
};
const TopSights = () => {
  const [sights, setSights] = useState<Sight[]>([])
  useEffect(()=>{
    const fetchData=async()=>{
      const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sights`)
      const data=await res.json()
      setSights(data)

    }
    fetchData()
  },[])
  if (sights.length === 0) return null;
  return (
    <section className="pt-[32px]">
      <Container>
        <h2 className="text-3xl font-bold text-neutral-900 mb-8">
          Top Sights to See
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
          
          {sights.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="relative group md:col-span-6 h-[300px] md:h-full rounded-2xl overflow-hidden cursor-pointer"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Lớp phủ đen mờ */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              
              {/* Text */}
              <div className="absolute bottom-6 left-6 flex items-center gap-2">
                <span className="text-white font-bold text-2xl tracking-wide">
                  {item.name}
                </span>
                <span className="text-2xl">{item.flag_icon}</span>
              </div>
            </div>
          ))}
          {sights.slice(2, 5).map((item) => (
            <div
              key={item.id}
              className="relative group md:col-span-4 h-[250px] md:h-[280px] rounded-2xl overflow-hidden cursor-pointer"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              
              <div className="absolute bottom-6 left-6 flex items-center gap-2">
                <span className="text-white font-bold text-xl tracking-wide">
                  {item.name}
                </span>
                <span className="text-xl">{item.flag_icon}</span>
              </div>
            </div>
          ))}
          
        </div>
      </Container>
    </section>
  )
}

export default TopSights