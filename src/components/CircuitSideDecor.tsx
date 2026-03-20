const CircuitSideDecor = () => {
  return (
    <>
      {/* Left side decorations */}
      <div className="fixed left-0 top-0 bottom-0 w-12 hidden xl:flex flex-col items-center justify-between py-24 pointer-events-none z-0 opacity-[0.15]">
        {/* Vertical trace */}
        <div className="w-[1.5px] flex-1 bg-gradient-to-b from-transparent via-primary/60 to-transparent" />
        
        {/* Via holes */}
        {[...Array(6)].map((_, i) => (
          <div key={`lv-${i}`} className="absolute" style={{ top: `${15 + i * 14}%` }}>
            <div className="w-3 h-3 rounded-full border border-primary/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
            </div>
          </div>
        ))}

        {/* Horizontal trace stubs */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`lh-${i}`}
            className="absolute right-0 h-[1.5px] w-6 bg-gradient-to-r from-transparent to-primary/40"
            style={{ top: `${25 + i * 18}%` }}
          />
        ))}
      </div>

      {/* Right side decorations */}
      <div className="fixed right-0 top-0 bottom-0 w-12 hidden xl:flex flex-col items-center justify-between py-24 pointer-events-none z-0 opacity-[0.15]">
        {/* Vertical trace */}
        <div className="w-[1.5px] flex-1 bg-gradient-to-b from-transparent via-primary/60 to-transparent" />

        {/* Via holes */}
        {[...Array(6)].map((_, i) => (
          <div key={`rv-${i}`} className="absolute" style={{ top: `${20 + i * 12}%` }}>
            <div className="w-3 h-3 rounded-full border border-primary/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
            </div>
          </div>
        ))}

        {/* Horizontal trace stubs */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`rh-${i}`}
            className="absolute left-0 h-[1.5px] w-6 bg-gradient-to-l from-transparent to-primary/40"
            style={{ top: `${30 + i * 16}%` }}
          />
        ))}

        {/* Small component pads */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`rp-${i}`}
            className="absolute right-3"
            style={{ top: `${40 + i * 20}%` }}
          >
            <div className="flex flex-col gap-[3px]">
              <div className="w-[6px] h-[3px] bg-primary/25 rounded-[1px]" />
              <div className="w-[6px] h-[3px] bg-primary/25 rounded-[1px]" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default CircuitSideDecor;
