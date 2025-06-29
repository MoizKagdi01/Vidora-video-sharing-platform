"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
interface ViewContextProps {
  view: string;
  gridNo: number;
  toggleView: (index?: number) => void;
}

export const ViewContext = createContext<ViewContextProps | undefined>(
  undefined
);

export default function ViewProvider({
  children,
  defaultGridNo = 0, // 👈 optional prop to set default grid index
}: {
  children: ReactNode;
  defaultGridNo?: number;
}) {
  const [step, setStep] = useState(defaultGridNo);
  
  const colConfigs = [
    {
      base: "grid-cols-1",
      lg: "lg:grid-cols-4",
    },
    {
      base: "grid-cols-2",
      lg: "lg:grid-cols-5",
    },
    {
      base: "grid-cols-3",
      lg: "lg:grid-cols-6",
    },
  ];

  const gridClass = `grid gap-4 ${colConfigs[step].base} ${colConfigs[step].lg}`;

  const nextStep = (index?: number) => {
    if (typeof index === "number" && index >= 0 && index < colConfigs.length) {
      Cookies.set("grid", index.toString())
      console.log(Cookies.get("grid"));
      if (Cookies.get("grid"),{
          expires: 30
        }) {
        setStep(parseInt(Cookies.get("grid")||"0") || index);
      } else {
        setStep(index);
      }
    } else {
      setStep((prev) => {
        const clickedIndex = (prev + 1) % colConfigs.length
        Cookies.set("grid", clickedIndex.toString(),{
          expires: 30
        })
        return clickedIndex;
      });
    }
  };

  return (
    <ViewContext.Provider
      value={{ view: gridClass, gridNo: step, toggleView: nextStep }}
    >
      {children}
    </ViewContext.Provider>
  );
}

export const useView = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
};
