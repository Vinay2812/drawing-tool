import { type ToolsType, tools } from "../tools";

type Props = {
    activeTool: ToolsType;
    setActiveTool: (tool: ToolsType) => void;
};

export default function Toolbox({ activeTool, setActiveTool }: Props) {
    return (
        <div className="flex flex-col gap-2 p-4 h-screen w-fit bg-zinc-400">
            {Object.entries(tools).map(([toolName, tool]) => {
                return (
                    <button
                        key={toolName}
                        onClick={() => setActiveTool(toolName as ToolsType)}
                        className={`text-white ${activeTool === toolName && "border-2 p-2"}`}
                    >
                        {tool.icon}
                    </button>
                );
            })}
        </div>
    );
}
