"use client";

import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselItem,
  CarouselApi,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
interface FilterCarouselProps {
  value?: string | null;
  isLoading?: boolean;
  onSelect?: (value: string | null) => void;
  data: {
    value: string;
    label: string;
  }[];
}
const FilterCarousel = ({value,isLoading,onSelect,data}: FilterCarouselProps) => {

    const [api, setApi] = useState<CarouselApi >();
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!api) {
            return;
        }
        setCurrent(api.selectedScrollSnap()+1)
        setCount(api.scrollSnapList().length)
        
        api.on("select",()=>{
            setCurrent(api.selectedScrollSnap()+1)
        })

    }, [api])
    return (
    <div className="w-full relative">
        {/* left fade */}
        <div className={cn("absolute left-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none", current === 1 && "hidden")} />
        <Carousel opts={{align: "start",dragFree: true,}} setApi={setApi} className="w-full px-12">
            <CarouselContent className="-ml-3">
                <CarouselItem className="pl-3 basis-auto" onClick={()=>onSelect?.(null)}>
                    <Badge variant={`${value === null ? "default" : "secondary"}`}
                    className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm font-medium">
                        ALL
                    </Badge>
                </CarouselItem>
                {
                    isLoading && Array.from({length: 21}).map((_,index)=>(
                        <CarouselItem key={index} onClick={()=>onSelect?.(null)} className="pl-3 basis-auto">
                            <Skeleton className="rounded-lg w-20 px-3 py-1 cursor-pointer whitespace-nowrap text-sm ">
                                &nbsp;
                            </Skeleton>
                        </CarouselItem>
                    ))
                }
                {
                    !isLoading && data.map((item) => (
                        <CarouselItem key={item.value} onClick={()=>onSelect?.(item.value)} className="pl-3 basis-auto">
                            <Badge variant={`${value === item.value ? "default" : "secondary"}`}
                            className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm font-medium">
                                {item.label}
                            </Badge>
                        </CarouselItem>
                    ))
                }
            </CarouselContent>
            <CarouselPrevious className="left-0 z-20" />
            <CarouselNext className="right-0 z-20" />
        </Carousel>
                {/* right fade */}
                <div className={cn("absolute right-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none", current === count && "hidden")} />
    </div>
  )
};

export default FilterCarousel;
