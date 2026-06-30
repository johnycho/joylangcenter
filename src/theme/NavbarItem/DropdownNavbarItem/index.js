/**
 * Swizzled DropdownNavbarItem
 * - 데스크톱 동작은 기본과 동일
 * - 모바일: 부모 항목에 링크(to/href)가 있으면 탭 시 펼침 토글 대신 페이지 이동하도록 변경
 *   (이 경우 하위 메뉴는 펼쳐진 상태로 항상 노출)
 */
import React, {useState, useRef, useEffect} from 'react';
import clsx from 'clsx';
import {
  isRegexpStringMatch,
  useCollapsible,
  Collapsible,
} from '@docusaurus/theme-common';
import {isSamePath, useLocalPathname} from '@docusaurus/theme-common/internal';
import NavbarNavLink from '@theme/NavbarItem/NavbarNavLink';
import NavbarItem from '@theme/NavbarItem';
import styles from './styles.module.css';

function isItemActive(item, localPathname) {
  if (isSamePath(item.to, localPathname)) {
    return true;
  }
  if (isRegexpStringMatch(item.activeBaseRegex, localPathname)) {
    return true;
  }
  if (item.activeBasePath && localPathname.startsWith(item.activeBasePath)) {
    return true;
  }
  return false;
}

function containsActiveItems(items, localPathname) {
  return items.some((item) => isItemActive(item, localPathname));
}

function DropdownNavbarItemDesktop({
  items,
  position,
  className,
  onClick,
  ...props
}) {
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current || dropdownRef.current.contains(event.target)) {
        return;
      }
      setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('focusin', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('focusin', handleClickOutside);
    };
  }, [dropdownRef]);
  return (
    <div
      ref={dropdownRef}
      className={clsx('navbar__item', 'dropdown', 'dropdown--hoverable', {
        'dropdown--right': position === 'right',
        'dropdown--show': showDropdown,
      })}>
      <NavbarNavLink
        aria-haspopup="true"
        aria-expanded={showDropdown}
        role="button"
        href={props.to ? undefined : '#'}
        className={clsx('navbar__link', className)}
        {...props}
        onClick={props.to ? undefined : (e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            setShowDropdown(!showDropdown);
          }
        }}>
        {props.children ?? props.label}
      </NavbarNavLink>
      <ul className="dropdown__menu">
        {items.map((childItemProps, i) => (
          <NavbarItem
            isDropdownItem
            activeClassName="dropdown__link--active"
            {...childItemProps}
            key={i}
          />
        ))}
      </ul>
    </div>
  );
}

function DropdownNavbarItemMobile({
  items,
  className,
  position, // Need to destructure position from props so that it doesn't get passed on.
  onClick,
  ...props
}) {
  const localPathname = useLocalPathname();
  const containsActive = containsActiveItems(items, localPathname);
  // 부모 항목 자체가 이동할 링크를 가지는지 여부
  const hasLink = Boolean(props.to || props.href);
  const {collapsed, toggleCollapsed, setCollapsed} = useCollapsible({
    initialState: () => !containsActive,
  });
  // Expand/collapse if any item active after a navigation
  useEffect(() => {
    if (containsActive) {
      setCollapsed(!containsActive);
    }
  }, [localPathname, containsActive, setCollapsed]);

  // 부모에 링크가 있으면: 이름 = 페이지 이동, 화살표 = 펼침/접힘
  if (hasLink) {
    return (
      <li
        className={clsx('menu__list-item', {
          'menu__list-item--collapsed': collapsed,
        })}>
        <div className="menu__list-item-collapsible">
          <NavbarNavLink
            className={clsx('menu__link menu__link--sublist', className)}
            {...props}
            onClick={(e) => {
              // 기본 이동 동작 유지 + 모바일 메뉴 닫기
              onClick?.(e);
            }}>
            {props.children ?? props.label}
          </NavbarNavLink>
          <button
            type="button"
            aria-label="하위 메뉴 펼치기/접기"
            aria-expanded={!collapsed}
            className="clean-btn menu__caret"
            onClick={(e) => {
              e.preventDefault();
              toggleCollapsed();
            }}
          />
        </div>
        <Collapsible lazy as="ul" className="menu__list" collapsed={collapsed}>
          {items.map((childItemProps, i) => (
            <NavbarItem
              mobile
              isDropdownItem
              onClick={onClick}
              activeClassName="menu__link--active"
              {...childItemProps}
              key={i}
            />
          ))}
        </Collapsible>
      </li>
    );
  }

  // 링크가 없는 부모: 기존 동작(이름 탭 = 펼침/접힘)
  return (
    <li
      className={clsx('menu__list-item', {
        'menu__list-item--collapsed': collapsed,
      })}>
      <NavbarNavLink
        role="button"
        className={clsx(
          styles.dropdownNavbarItemMobile,
          'menu__link menu__link--sublist menu__link--sublist-caret',
          className,
        )}
        {...props}
        onClick={(e) => {
          e.preventDefault();
          toggleCollapsed();
        }}>
        {props.children ?? props.label}
      </NavbarNavLink>
      <Collapsible lazy as="ul" className="menu__list" collapsed={collapsed}>
        {items.map((childItemProps, i) => (
          <NavbarItem
            mobile
            isDropdownItem
            onClick={onClick}
            activeClassName="menu__link--active"
            {...childItemProps}
            key={i}
          />
        ))}
      </Collapsible>
    </li>
  );
}

export default function DropdownNavbarItem({mobile = false, ...props}) {
  const Comp = mobile ? DropdownNavbarItemMobile : DropdownNavbarItemDesktop;
  return <Comp {...props} />;
}
