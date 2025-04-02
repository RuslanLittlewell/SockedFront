import { tokenState } from "@/store";
import { FC } from "react";
import { useRecoilValue } from "recoil";

interface Props {
  username: string;
}
export const Header: FC<Props> = ({ username }) => {

  const tokens = useRecoilValue(tokenState);
  return (
    <>
      <div className="flex justify-between h-[88px] bg-white pt-[6px]">
        <div className="pl-[15px]">
          <img
            className="w-[198px]"
            src="https://web.static.mmcdn.com/images/logo.svg?hash=c8f1812f6233"
            alt=""
          />
          <p className="text-black text-[10px] pl-[17px]">
            THE ACT OF MASTURBATING WHILE CHATTING ONLINE
          </p>
        </div>
        <div className="h-[75px] w-[247px] mt-[7px] mr-[15px] border border-[#0c6a93] border-b-0">
          <div className="bg-[#0c6a93] pt-[3px] pb-[4px] rounded-t-[2px] h-[24px] text-xs text-left px-2 text-white">
            {username}
          </div>
          <div className="bg-[#e9e9e9] h-[50px] text-xs p-[4px]">
            <div className="grid grid-cols-[70px_1fr_1fr] justify-items-start mb-[5px]">
              <span>Status:</span> <span>Basic Member</span>
            </div>
            <div className="grid grid-cols-[70px_1fr_1fr] justify-items-start mb-[5px]">
              <span>You have:</span> <span>{tokens} Tokens</span>
            </div>
          </div>
        </div>
      </div>
      <div className="nav-bar pl-[15px] bg-[#0c6a93] border-b-[3px] border-[#f47321] py-2">
        <ul className="nav flex gap-[20px]">
          <li className="block text-shadow">
            <a
              href="/"
              className="text-white font-bold text-[13.999px] font-ubuntu"
            >
              HOME
            </a>
          </li>
          <li className="block text-shadow">
            <a
              href="/"
              className="text-white font-bold text-[13.999px] font-ubuntu"
            >
              <span className="header-title">DISCOVER</span>
            </a>
          </li>

          <li className="block text-shadow">
            <a
              href="/"
              className="text-white font-bold text-[13.999px] font-ubuntu"
            >
              TAGS
            </a>
          </li>
          <li className="block text-shadow">
            <a
              href="/"
              className="text-white font-bold text-[13.999px] font-ubuntu"
            >
              PRIVATE SHOWS
            </a>
          </li>

          <li className="block text-shadow">
            <a
              href="/followed-cams/offline/"
              className="text-white font-bold text-[13.999px] font-ubuntu"
            >
              <div className="inline-block">
                <span className="followed_text">FOLLOWING</span>
                <span className="followed_counts" data-paction-name="FOLLOWED">
                  (0/0)
                </span>
              </div>
            </a>
          </li>

          <li className="block text-shadow">
            <a
              id="merch"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-bold text-[13.999px] font-ubuntu"
            >
              MERCH
            </a>
          </li>

          <li className="block text-shadow ml-auto pr-[15px]">
            <a
              href="/"
              className="text-white font-bold text-[13.999px] font-ubuntu"
            >
              BROADCAST YOURSELF
            </a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Header;
