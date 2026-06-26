import { Bot } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export const FabASKai = () => {
    return (
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9999]">
            <Link href="/dashboard/chat" className="block">
                <div className='flex justify-center items-center rounded-2xl bg-[#EB0A1E] text-white p-4 cursor-pointer shadow-lg hover:bg-red-700 transition-all group overflow-hidden'>
                    <Bot size={28} />
                    <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-3 transition-all duration-300 font-medium whitespace-nowrap">
                        Ask Copilot
                    </span>
                </div>
            </Link>
        </div>
    )
}
