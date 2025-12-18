import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "hsl(240 10% 3.9%)",
          "--normal-text": "hsl(0 0% 98%)",
          "--normal-border": "hsl(240 3.7% 15.9%)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
