import { type ToolsType, tools } from "../tools";

type Props = {
    activeTool: ToolsType;
    setActiveTool: (tool: ToolsType) => void;
};

export default function Toolbox({ activeTool, setActiveTool }: Props) {
    return (
        <div className="flex gap-2 p-4 w-screen h-fit bg-zinc-400">
            {Object.entries(tools).map(([toolName, tool]) => {
                return (
                    <button
                        key={toolName}
                        onClick={() => setActiveTool(toolName as ToolsType)}
                        className={`text-white p-2 cursor-pointer ${
                            activeTool === toolName ? "bg-slate-100" : "bg-transparent"
                        }`}
                    >
                        {tool.icon}
                    </button>
                );
            })}
        </div>
    );
}
