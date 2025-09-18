interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

export const AnimatedBackground = ({ children }: AnimatedBackgroundProps) => {
  return (
    <>
      {/* Background dengan animasi gradient dan wave effect */}
      <div className="animated-gradient" />
      
      {/* Konten utama */}
      <div className="relative">
        {children}
      </div>
    </>
  );
};