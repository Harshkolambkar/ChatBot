import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Plus, MessageSquare, Pencil, Trash2, Image, FileText, Code, Sparkles, ChevronUp, ChevronDown, LogOut, Sun, Moon, User } from "lucide-react";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthContext";

interface Session {
  id: string;
  title: string;
  timestamp: string;
}

interface SessionListProps {
  readonly sessions: Session[];
  readonly activeSessionId: string;
  readonly onSessionSelect: (id: string) => void;
  readonly onNewSession: () => void;
  readonly onRenameSession: (id: string) => void;
  readonly onDeleteSession: (id: string) => void;
  readonly onAccountSettings: () => void;
}

export function SessionList({ sessions, activeSessionId, onSessionSelect, onNewSession, onRenameSession, onDeleteSession, onAccountSettings }: SessionListProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [toolsOpen, setToolsOpen] = useState(true);
  const [conversationsOpen, setConversationsOpen] = useState(true);
  
  const tools = [
    { icon: Image, label: "Image Generation", color: "text-purple-600 dark:text-purple-400" },
    { icon: FileText, label: "Document Analysis", color: "text-blue-600 dark:text-blue-400" },
    { icon: Code, label: "Code Helper", color: "text-green-600 dark:text-green-400" },
    { icon: Sparkles, label: "Creative Writing", color: "text-amber-600 dark:text-amber-400" },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-full flex-col border-r bg-slate-50 dark:bg-slate-900">
      <div className="p-4">
        <Button onClick={onNewSession} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <Separator />
      
      {/* Tools Section */}
      <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
        <div className="p-4 pb-2">
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between hover:opacity-80">
              <h3 className="text-slate-700 dark:text-slate-300">Tools</h3>
              {toolsOpen ? (
                <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool) => (
                <button
                  key={tool.label}
                  className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
                >
                  <tool.icon className={`h-5 w-5 ${tool.color}`} />
                  <span className="text-center text-slate-700 dark:text-slate-300">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      <Separator />
      
      {/* Conversations Section */}
      <Collapsible open={conversationsOpen} onOpenChange={setConversationsOpen} className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 pb-2">
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between hover:opacity-80">
              <h3 className="text-slate-700 dark:text-slate-300">Conversations</h3>
              {conversationsOpen ? (
                <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative w-full rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${
                    activeSessionId === session.id ? "bg-slate-200 dark:bg-slate-800" : ""
                  }`}
                >
                  <button
                    onClick={() => onSessionSelect(session.id)}
                    className="w-full p-3 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 flex-shrink-0 text-slate-600 dark:text-slate-400" />
                      <div className="flex-1 overflow-hidden pr-20">
                        <p className="truncate dark:text-slate-200">{session.title}</p>
                        <p className="truncate text-slate-500 dark:text-slate-400">{session.timestamp}</p>
                      </div>
                    </div>
                  </button>
                  <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1 opacity-50 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRenameSession(session.id);
                      }}
                      className="rounded p-1.5 hover:bg-slate-300 dark:hover:bg-slate-700"
                      aria-label="Rename session"
                    >
                      <Pencil className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="rounded p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30"
                      aria-label="Delete session"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* User Profile Section */}
      <Separator />
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden text-left">
                <p className="truncate dark:text-slate-200">{user?.name}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onAccountSettings}>
              <User className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === "dark" ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark Mode</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
