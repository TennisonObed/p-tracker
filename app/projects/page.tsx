import Navbar from "@/components/Navbar";


const stats = [
    { label: "Total Projects", value: "8", accent: "bg-violet-50 text-violet-700" },
    { label: "In Progress", value: "3", accent: "bg-amber-50 text-amber-700" },
    { label: "Completed", value: "4", accent: "bg-emerald-50 text-emerald-700" },
    { label: "To Do", value: "2", accent: "bg-slate-100 text-slate-700" },
];

export default function Projects() {
    return (

        <div className="flex min-h-screen">
            <Navbar />

            <h1>Project Page</h1>
        </div>

    )
}