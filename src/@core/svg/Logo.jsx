const Logo = props => {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="100" height="100" rx="20" fill="#1976d2" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontSize="60"
        fill="white"
        fontWeight="bold"
      >
        D
      </text>
    </svg>
  )
}

export default Logo
