import React from 'react'

interface ContainerProps {
  children: React.ReactNode,
  className?: string
}
const Container = ({children, className=''}: ContainerProps) => {
  return (
    <div className={`max-w-308 mx-auto px-4 overflow-x-hidden ${className} `}>{children}</div>
  )
}

export default Container