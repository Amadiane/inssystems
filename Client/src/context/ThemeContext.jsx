import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("ss-theme") || "light"
  );

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("ss-theme", next);
      return next;
    });
  };

  const tokens = theme === "light" ? {
    bg:          "#F7F3EC",
    surface:     "#EDE5D0",
    card:        "#E4D9C0",
    border:      "#D4C08A",
    borderHover: "#B89A50",
    text:        "#2C1A00",
    textMuted:   "#8A6A20",
    textDim:     "#B8A070",
    gold:        "#C9A84C",
    goldLight:   "#8A6A20",
    goldDark:    "#5C3D00",
    success:     "#1A6B3C",
    successBg:   "#D4EDDF",
    warning:     "#92600A",
    warningBg:   "#FEF3CC",
    danger:      "#A32020",
    dangerBg:    "#FDEAEA",
    scrollTrack: "#EDE5D0",
    scrollThumb: "#C9A84C",
    // Nav
    navBg:       "#F0E8D0",
    navBorder:   "#D4C08A",
    navText:     "#5C3D00",
    navHover:    "#E4D9C0",
    navActive:   "#C9A84C",
    dropdownBg:  "#F7F3EC",
  } : {
    bg:          "#1C1810",
    surface:     "#26211A",
    card:        "#312B22",
    border:      "#4A3F28",
    borderHover: "#7A6535",
    text:        "#F0E8D0",
    textMuted:   "#A89060",
    textDim:     "#6A5A38",
    gold:        "#C9A84C",
    goldLight:   "#F0D080",
    goldDark:    "#8A6A20",
    success:     "#6DD9A0",
    successBg:   "#162A1E",
    warning:     "#F5B040",
    warningBg:   "#2A1E08",
    danger:      "#E87070",
    dangerBg:    "#2A1212",
    scrollTrack: "#1C1810",
    scrollThumb: "#C9A84C",
    // Nav
    navBg:       "#1C1810",
    navBorder:   "#4A3F28",
    navText:     "#F0E8D0",
    navHover:    "#312B22",
    navActive:   "#C9A84C",
    dropdownBg:  "#26211A",
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, tokens, isLight: theme === "light" }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);