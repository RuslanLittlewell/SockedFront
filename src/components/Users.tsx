import { FC } from "react";

interface Props {
  users: (string | undefined)[];
}
export const Users: FC<Props> = ({ users }) => {
  return (
    <div className="bg-white h-[calc(100%-25px)]">
      <div className="fex flex-col gap-2 pt-3">
        {users.map((i, idx) => (
          <div key={idx} className="font-bold text-sm text-left pl-3">{i}</div>
        ))}
      </div>
    </div>
  );
};
