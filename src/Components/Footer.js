import React, { useContext } from "react";
import { FaFacebookF, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { CiMail, CiPhone } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";
import { LanguageContext } from "../context/LanguageContext";

const Footer = () => {
  const { t } = useContext(LanguageContext);
  return (
    <footer className="bg-[#0F172A] text-white py-10 border-t border-[#4addbf40] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#4addbf20] to-transparent blur-3xl"></div>

      <div className="container mx-auto px-12 relative z-10 grid md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-[#4addbf] font-semibold text-lg mb-3 px-28">
            {t("footer.quick")}
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li>
              <a href="/" className="hover:text-[#4addbf] transition px-28">
                {t("footer.home")}
              </a>
            </li>
            <li>
              <a href="/map" className="hover:text-[#4addbf] transition px-28">
                {t("footer.map")}
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="hover:text-[#4addbf] transition px-28"
              >
                {t("footer.contact")}
              </a>
            </li>
            <li>
              <a
                href="/aboutus"
                className="hover:text-[#4addbf] transition px-28"
              >
                {t("footer.about")}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[#4addbf] font-semibold text-lg mb-3">
            {t("footer.newsletter")}
          </h3>
          <p className="text-sm text-gray-400 mb-3">
            {t("footer.newsletter.text")}
          </p>
          <form className="flex space-x-2">
            <input
              type="email"
              placeholder={t("footer.newsletter.placeholder")}
              className="flex-1 bg-transparent border border-[#4addbf] rounded-lg px-3 py-2 focus:outline-none text-white"
            />
            <button className="bg-[#4addbf] hover:bg-[#39c6a5] text-black px-4 py-2 rounded-lg font-semibold transition">
              {t("footer.newsletter.join")}
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-[#4addbf] font-semibold text-lg mb-3">
            {t("footer.follow")}
          </h3>
          <div className="flex space-x-4">
            {[FaFacebookF, FaXTwitter, FaInstagram, FaLinkedinIn].map(
              (Icon, i) => (
                <Icon
                  key={i}
                  size={24}
                  className="cursor-pointer hover:text-[#4addbf] transition"
                />
              )
            )}
          </div>
        </div>

        <div>
          <h3 className="text-[#4addbf] font-semibold text-lg mb-3">
            {t("footer.touch")}
          </h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center space-x-3">
              <CiPhone size={22} /> <span>{t("footer.phone")}</span>
            </li>
            <li className="flex items-center space-x-3">
              <CiMail size={22} /> <span>{t("footer.email")}</span>
            </li>
            <li className="flex items-center space-x-3">
              <IoLocationOutline size={22} />{" "}
              <span>{t("footer.location")}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-gray-500 mt-8 text-sm border-t border-[#4addbf20] pt-4">
        © {new Date().getFullYear()} {t("footer.copyright")}
      </div>
    </footer>
  );
};

export default Footer;
