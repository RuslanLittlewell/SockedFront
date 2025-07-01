import { chatActiveTabState, privateChatUserState, Users } from "@/store";
import clsx from "clsx";
import { FC, useRef, useEffect } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { LuUserRoundX } from "react-icons/lu";
import { TfiEmail } from "react-icons/tfi";
import { useSetRecoilState } from "recoil";
import { Socket } from "socket.io-client";

interface Props {
  menuPosition: { x: number; y: number };
  selectedUser: Users;
  socket: Socket;
  closeMenu: () => void;
}

export const UserContext: FC<Props> = ({
  menuPosition,
  selectedUser,
  socket,
  closeMenu,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const setTab = useSetRecoilState(chatActiveTabState);
  const setSelectedUser = useSetRecoilState(privateChatUserState);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMenu]);

  const handleOpenDirect = () => {
    setTab(1);
    setSelectedUser(selectedUser.name);
  };

  const handleIgnoreUser = () => {
    socket?.emit("set-user-join", { id: selectedUser.id });
    closeMenu();
  };

  return (
    <div
      ref={containerRef}
      className="fixed bg-white border border-gray-300 rounded shadow-lg z-10 w-[210px]"
      style={{
        top: menuPosition.y,
        left: menuPosition.x,
      }}
    >
      <div
        className={clsx(
          "flex place-content-between font-bold bg-gray-200 text-sm underline p-2",
          selectedUser.color
        )}
      >
        {selectedUser.name}

        <img
          className="w-[15px]"
          src="https://web.static.mmcdn.com/tsdefaultassets/gendericons/male.svg"
          alt="gender-icon"
        />
      </div>
      <div
        className={clsx(
          "p-2 text-left font-bold border border-b-[#f0f0f0]",
          selectedUser.color
        )}
      >
        Tipped Tons
      </div>
      <ul className="text-sm text-gray-700 border border-b-[#f0f0f0] py-3">
        <li className="flex items-center cursor-pointer hover:underline px-2 py-1 gap-2" onClick={handleOpenDirect}>
          <TfiEmail  /> Send private message
        </li>
        <li className="flex items-center cursor-pointer hover:underline px-2 py-1 gap-2" onClick={handleOpenDirect} >
          <FiMessageSquare /> Send direct message
        </li>
        <li className="flex items-center cursor-pointer hover:underline px-2 py-1 gap-2">
          <MdOutlineAlternateEmail /> Mention this user
        </li>
        <li className="flex items-center cursor-pointer hover:underline px-2 py-1 gap-2" onClick={handleIgnoreUser}>
          <LuUserRoundX />
          Ignore this user
        </li>
      </ul>
      <div className="mt-3">
        <label className="block text-xs text-gray-400 mb-1">
          Note (only seen by you)
        </label>
        <textarea
          className="w-full border border-gray-300 bg-white rounded px-2 py-1 text-xs"
          rows={3}
          placeholder="Enter notes about this user"
        ></textarea>
      </div>
    </div>
  );
};
