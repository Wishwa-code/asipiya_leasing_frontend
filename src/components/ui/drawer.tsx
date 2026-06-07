import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

const DrawerContext = React.createContext<{
  direction?: "top" | "right" | "bottom" | "left"
}>({})

const Drawer = ({
  shouldScaleBackground = false,
  direction = "right",
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerContext.Provider value={{ direction }}>
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      direction={direction}
      {...props}
    />
  </DrawerContext.Provider>
)
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-gray-900/15 dark:bg-gray-950/25 backdrop-blur-[2px] transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
      className
    )}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { direction } = React.useContext(DrawerContext)

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        data-direction={direction}
        className={cn(
          "fixed z-50 flex flex-col bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 shadow-2xl transition-all duration-300",
          // Bottom direction
          "data-[direction=bottom]:inset-x-0 data-[direction=bottom]:bottom-0 data-[direction=bottom]:h-auto data-[direction=bottom]:max-h-[85vh] data-[direction=bottom]:rounded-t-[20px] data-[direction=bottom]:border-t data-[direction=bottom]:translate-y-full data-[state=open]:data-[direction=bottom]:translate-y-0",
          // Right direction
          "data-[direction=right]:inset-y-0 data-[direction=right]:right-0 data-[direction=right]:h-full data-[direction=right]:w-full data-[direction=right]:max-w-xl data-[direction=right]:border-l data-[direction=right]:translate-x-full data-[state=open]:data-[direction=right]:translate-x-0",
          // Left direction
          "data-[direction=left]:inset-y-0 data-[direction=left]:left-0 data-[direction=left]:h-full data-[direction=left]:w-full data-[direction=left]:max-w-xl data-[direction=left]:border-r data-[direction=left]:-translate-x-full data-[state=open]:data-[direction=left]:translate-x-0",
          // Top direction
          "data-[direction=top]:inset-x-0 data-[direction=top]:top-0 data-[direction=top]:h-auto data-[direction=top]:max-h-[85vh] data-[direction=top]:rounded-b-[20px] data-[direction=top]:border-b data-[direction=top]:-translate-y-full data-[state=open]:data-[direction=top]:translate-y-0",
          className
        )}
        {...props}
      >
        {direction === "bottom" && (
          <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-gray-100 dark:bg-gray-800 shrink-0" />
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left shrink-0", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4 shrink-0", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-gray-400 dark:text-gray-500", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
