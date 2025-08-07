import { Clock } from 'lucide-react'
import React from 'react'

 const Logo = () => {
  return (
    <div className='flex flex-row gap-2 items-center'>
     <div className="bg-[#e5f0F0] p-1 rounded-lg">
              <Clock className="h-5 w-5 text-[#0F6973] " />
            </div>
            <h2 className="text-xl font-semibold text-[#0F6973] ">WorKSyc</h2>
            </div>
  )
}

export default Logo;
