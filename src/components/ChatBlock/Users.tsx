import { FC, useState, MouseEvent } from "react";
import clsx from "clsx";
import { Users } from "@/store";
import { UserContext } from "./ContextUser";
import { Socket } from "socket.io-client";

interface Props {
  users: Users[];
  socket: Socket;
}

export const UsersTab: FC<Props> = ({ users, socket }) => {
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const handleUserClick = (e: MouseEvent<HTMLDivElement>, user: Users) => {
    const targetElement = e.currentTarget;
    const rect = targetElement.getBoundingClientRect();

    const top = rect.top + window.scrollY - 10;
    const left = rect.left + window.scrollX - 10;

    setMenuPosition({ y: top, x: left });

    setSelectedUser(user);
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setSelectedUser(null);
  };

  const colorOrder: { [key: string]: number } = {
    "text-green-500": 1,
    "text-red-500": 2,
    "text-purple-500": 3,
    "text-pink-500": 4,
    "text-blue-500": 5,
  };

  const sortedUsers = [...users].sort((a, b) => {
    return (colorOrder[a.color] || 999) - (colorOrder[b.color] || 999);
  });

  return (
    <div className="relative overflow-auto bg-white h-[calc(100%-25px)]">
      <div className="flex flex-col gap-1 pt-3">
        {sortedUsers.map((user, idx) => {
          if (user.joined) {
            return (
              <div key={idx} className="flex pl-3 items-center">
                <img
                  className="mr-2 w-[15px]"
                  src="https://web.static.mmcdn.com/tsdefaultassets/gendericons/male.svg"
                  alt="gender-icon"
                />
                <div
                  onClick={(e) => handleUserClick(e, user)}
                  className={clsx(
                    "font-bold text-sm text-left cursor-pointer hover:underline",
                    user.color
                  )}
                >
                  {user.name}
                </div>
              </div>
            );
          }
        })}
      </div>

      {isOpen && selectedUser && (
        <UserContext
          selectedUser={selectedUser}
          menuPosition={menuPosition}
          closeMenu={closeMenu}
          socket={socket}
        />
      )}
    </div>
  );
};
