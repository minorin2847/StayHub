import React from "react";
import Container from "../ui/Container";
import Link from "next/link";
import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcPaypal,
  FaCcStripe,
  FaGooglePay,
  FaApplePay,
} from "react-icons/fa";

const MainFooter = () => {
  return (
    <footer className="bg-[#121316] pt-16 pb-8 text-gray-400">
      <Container>
        <div className="grid grid-cols-5 gap-[24px] mb-12">
          <div className="col-span-1 flex flex-col gap-6">
            <div className="flex items-center justify-start grow rounded-2xl h-[55px] w-[55px] overflow-hidden">
              <Image
                className=""
                src="/images/logo.png"
                alt="Stayhub logo"
                width={60}
                height={60}
              />
            </div>

            <p className="text-[13px] leading-relaxed text-white">
              We help you find and book the perfect stay from cozy guesthouses to top hotels-with ease, trust, and the best deals.
            </p>

            <div className="flex flex-col gap-4 mt-2">
              <h4 className="text-[#99BDFF] font-semibold">Download Our App</h4>
              <div className="flex gap-3">
                <div className="w-[120px] h-[40px] bg-neutral-800 rounded-lg flex items-center justify-center border border-neutral-700 cursor-pointer hover:bg-neutral-700 transition">
                  <span className="text-xs text-white">App Store</span>
                </div>
                <div className="w-[120px] h-[40px] bg-neutral-800 rounded-lg flex items-center justify-center border border-neutral-700 cursor-pointer hover:bg-neutral-700 transition">
                  <span className="text-xs text-white">Google Play</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pl-[12px]">
            <h3 className="text-[#99BDFF] font-semibold mb-[14px] text-lg">
              Explore
            </h3>
            <ul className="flex flex-col gap-[14px] text-sm">
              <li>
                <Link href="#" className="hover:text-white transition">
                  Trending Destinations
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Summer Hotspots
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Winter Getaways
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Weekend Deals
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Family-Friendly Stays
                </Link>
              </li>
            </ul>
          </div>

          <div className="pl-[12px]">
            <h3 className="text-[#99BDFF] font-semibold mb-[14px] text-lg">
              Property Types
            </h3>
            <ul className="flex flex-col gap-[14px] text-sm">
              <li>
                <Link href="#" className="hover:text-white transition">
                  Hotels
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Apartments
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Villas
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Cabins
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Glamping
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Domes
                </Link>
              </li>
            </ul>
          </div>

          <div className="pl-[12px]">
            <h3 className="text-[#99BDFF] font-semibold mb-[14px] text-lg">
              Support
            </h3>
            <ul className="flex flex-col gap-[14px] text-sm">
              <li>
                <Link href="#" className="hover:text-white transition">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Live Chat Support
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="pl-[12px]">
            <h3 className="text-[#99BDFF] font-semibold mb-[14px] text-lg">
              Get In Touch
            </h3>
            <ul className="flex flex-col gap-[14px] text-sm mb-6">
              <li className="text-white">+84 09123456789</li>
              <li className="text-white">stayhub.project@gmail.com</li>
            </ul>

            <div className="flex gap-3">
              {[FaFacebookF, FaInstagram, FaYoutube, FaTwitter].map(
                (Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-[#99BDFF] hover:text-white transition-all duration-300 text-white"
                  >
                    <Icon size={18} />
                  </a>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-neutral-800 mb-8"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2025 StayHub. All rights reserved.</p>

          <div className="flex items-center gap-3">
            <div className="bg-white px-2 py-1 rounded">
              <FaCcVisa size={24} color="#1A1F71" />
            </div>
            <div className="bg-white px-2 py-1 rounded">
              <FaCcMastercard size={24} color="#EB001B" />
            </div>
            <div className="bg-white px-2 py-1 rounded">
              <FaCcAmex size={24} color="#2E77BC" />
            </div>
            <div className="bg-white px-2 py-1 rounded">
              <FaCcStripe size={24} color="#6772E5" />
            </div>
            <div className="bg-white px-2 py-1 rounded">
              <FaCcPaypal size={24} color="#003087" />
            </div>
            <div className="bg-white px-2 py-1 rounded">
              <FaGooglePay size={24} color="#5F6368" />
            </div>
            <div className="bg-white px-2 py-1 rounded">
              <FaApplePay size={24} color="black" />
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default MainFooter;
