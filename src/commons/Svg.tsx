/* eslint-disable */
"use client";
import { assets } from "@/public/assets";
import React, { useEffect, useState } from "react";

export type IconName = keyof typeof assets;

interface SVGProps {
    icon: IconName;
    w?: string;
    h?: string;
    fill?: string;
    stroke?: string;
    className?: string;
    onClick?: () => void;
}

const toCamelCase = (str: string) =>
    str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

export default function Svg({ icon, w, h, fill, stroke, className, onClick }: SVGProps) {
    const [svgElement, setSvgElement] = useState<React.ReactNode | null>(null);

    useEffect(() => {
        const svgString = assets[icon] as unknown as string;
        if (!svgString) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, "image/svg+xml");
        const svgEl = doc.documentElement;

        if (w) svgEl.setAttribute("width", w);
        if (h) svgEl.setAttribute("height", h);
        if (fill) svgEl.querySelectorAll("*").forEach(el => el.setAttribute("fill", fill));
        if (stroke) svgEl.querySelectorAll("*").forEach(el => el.setAttribute("stroke", stroke));
        if (className) svgEl.setAttribute("class", className); // keep for DOM parsing

        let keyCounter = 0;
        const domToReact = (el: Element): React.ReactNode => {
            const children = Array.from(el.children).map(domToReact);
            const props: any = {};
            Array.from(el.attributes).forEach(attr => {
                if (attr.name === "class") {
                    props.className = attr.value;
                } else {
                    props[toCamelCase(attr.name)] = attr.value;
                }
            });

            if (el === svgEl && onClick) {
                props.onClick = onClick;
            }
            props.key = keyCounter++;
            return React.createElement(el.tagName, props, children.length ? children : el.textContent);
        };

        setSvgElement(domToReact(svgEl));
    }, [icon, w, h, fill, stroke, className, onClick]);

    return <>{svgElement}</>;
};