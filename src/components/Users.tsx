import { Users } from "@/store";
import clsx from "clsx";
import { FC } from "react";

interface Props {
  users: Users[];
}
export const UsersTab: FC<Props> = ({ users }) => {
  return (
    <div className="bg-white h-[calc(100%-25px)]">
      <div className="fex flex-col gap-2 pt-3">
        {users.map((i, idx) => (
          <div key={idx} className="flex pl-3 items-center">
            <img className="mr-2 w-[15px]" src="https://web.static.mmcdn.com/tsdefaultassets/gendericons/male.svg" />
            <div className={clsx("font-bold text-sm text-left", i.color)}>
              {i.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
