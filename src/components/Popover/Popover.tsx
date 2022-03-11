import { Fragment, createElement, useMemo } from 'react';
import { config, useTransition } from 'react-spring';

import { combineClassNames, createEventFn, isFn } from 'lib';
import { Portal } from 'components/Portal';

import type { TPopover } from './types';
import { POPOVER_CN, POPOVER_TARGET_CN } from './constants';
import { PopoverProvider, usePopover } from './hooks';
import { StyledAnimateContainer, StyledPopover, StyledPopoverTarget } from './styled';

const preventedFn = createEventFn();

export const Popover = <T extends HTMLElement = HTMLDivElement>({
  children,
  popover,
  popoverStyle,
  targetStyle,
  className,
  animate = true,
  isPortal = true,
  isPopoverVisible = true,
  onClose,
  animateContainerStyle,
  ...popoverOptions
}: TPopover<T>) => {
  const { popper, isPopoverOpen, setOpen, onToggle, targetRef } = usePopover<T>({ onClose, ...popoverOptions });

  const { ref, style, ...popperProps } = popper;

  const transitionStyle = useTransition(isPopoverOpen, {
    from: { y: -5, scale: 0 },
    enter: { y: 0, scale: 1 },
    leave: { y: -5, scale: 0 },
    config: config.stiff,
    immediate: !animate,
  });

  const ctx = useMemo(() => ({ isPopoverOpen, onToggle, setOpen }), [isPopoverOpen, onToggle, setOpen]);

  return (
    <PopoverProvider value={ctx}>
      {isFn(children) ? (
        children({ ref: targetRef, ...ctx })
      ) : (
        <StyledPopoverTarget
          ref={targetRef}
          className={POPOVER_TARGET_CN}
          isOpen={isPopoverOpen}
          onClick={onToggle}
          {...{ targetStyle }}
        >
          {children}
        </StyledPopoverTarget>
      )}
      {isPopoverVisible &&
        createElement(
          isPortal ? Portal : Fragment,
          isPortal ? { name: POPOVER_CN } : null,
          transitionStyle(
            (transitionStyle, item) =>
              item && (
                <StyledAnimateContainer
                  {...{ ref, ...popperProps }}
                  styled={animateContainerStyle}
                  style={{ ...style, ...transitionStyle }}
                >
                  <StyledPopover
                    className={combineClassNames(className, POPOVER_CN)}
                    onClick={preventedFn}
                    {...{ ...popperProps, isPopoverOpen, popoverStyle }}
                  >
                    {popover}
                  </StyledPopover>
                </StyledAnimateContainer>
              )
          )
        )}
    </PopoverProvider>
  );
};
