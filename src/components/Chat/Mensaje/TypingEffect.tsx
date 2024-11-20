import React, { useEffect, useState } from "react";

type TypingEffectProps = {
  message: string;
  speed?: number; // Velocidad opcional en milisegundos
};

const TypingEffect: React.FC<TypingEffectProps> = ({ message, speed }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + message.charAt(index));
      index++;
      if (index >= message.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval); // Limpia el intervalo al desmontar
  }, [message, speed]);

  return (
    <div className="border-l-4 border-[#9ffee4] pl-4 text-lg font-medium text-gray-700">
      {displayedText}
    </div>
  );
};

export default TypingEffect;
