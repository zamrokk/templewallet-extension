import React, { FC, useCallback, useMemo, useState } from 'react';

import classNames from 'clsx';

import AccountTypeBadge from 'app/atoms/AccountTypeBadge';
import { Button } from 'app/atoms/Button';
import DropdownWrapper from 'app/atoms/DropdownWrapper';
import Identicon from 'app/atoms/Identicon';
import Money from 'app/atoms/Money';
import Name from 'app/atoms/Name';
import { openInFullPage, useAppEnv } from 'app/env';
import { ReactComponent as AddIcon } from 'app/icons/add.svg';
import { ReactComponent as DAppsIcon } from 'app/icons/apps-alt.svg';
import { ReactComponent as DownloadIcon } from 'app/icons/download.svg';
import { ReactComponent as LinkIcon } from 'app/icons/link.svg';
import { ReactComponent as MaximiseIcon } from 'app/icons/maximise.svg';
import { ReactComponent as PeopleIcon } from 'app/icons/people.svg';
import { ReactComponent as SettingsIcon } from 'app/icons/settings.svg';
import Balance from 'app/templates/Balance';
import SearchField from 'app/templates/SearchField';
import { AnalyticsEventCategory, useAnalytics } from 'lib/analytics';
import { t, T } from 'lib/i18n/react';
import { useAccount, useRelevantAccounts, useSetAccountPkh, useTempleClient } from 'lib/temple/front';
import { PopperRenderProps } from 'lib/ui/Popper';
import { Link } from 'lib/woozie';

import { AccountDropdownSelectors } from './AccountDropdown.selectors';

type ExcludesFalse = <T>(x: T | false) => x is T;
type AccountDropdownProps = PopperRenderProps;

const AccountDropdown: FC<AccountDropdownProps> = ({ opened, setOpened }) => {
  const appEnv = useAppEnv();
  const { lock } = useTempleClient();
  const { trackEvent } = useAnalytics();
  const allAccounts = useRelevantAccounts();
  const account = useAccount();
  const setAccountPkh = useSetAccountPkh();
  const [searchValue, setSearchValue] = useState('');

  const isShowSearch = useMemo(() => allAccounts.length > 5, [allAccounts.length]);

  const filteredAccounts = useMemo(() => {
    if (searchValue.length === 0) {
      return allAccounts;
    } else {
      const lowerCaseSearchValue = searchValue.toLowerCase();

      return allAccounts.filter(currentAccount => currentAccount.name.toLowerCase().includes(lowerCaseSearchValue));
    }
  }, [searchValue, allAccounts]);

  const closeDropdown = useCallback(() => {
    setOpened(false);
  }, [setOpened]);

  const handleLogoutClick = useCallback(() => {
    lock();
  }, [lock]);

  const handleMaximiseViewClick = useCallback(() => {
    openInFullPage();
    if (appEnv.popup) {
      window.close();
    } else {
      closeDropdown();
    }
  }, [appEnv.popup, closeDropdown]);

  const actions = useMemo(
    () =>
      [
        {
          key: 'create-account',
          Icon: AddIcon,
          i18nKey: 'createAccount',
          linkTo: '/create-account',
          onClick: closeDropdown
        },
        {
          key: 'import-account',
          Icon: DownloadIcon,
          i18nKey: 'importAccount',
          linkTo: '/import-account',
          onClick: closeDropdown
        },
        {
          key: 'connect-ledger',
          Icon: LinkIcon,
          i18nKey: 'connectLedger',
          linkTo: '/connect-ledger',
          onClick: closeDropdown
        },
        {
          key: 'dapps',
          Icon: DAppsIcon,
          i18nKey: 'dapps',
          linkTo: '/dApps',
          onClick: closeDropdown
        },
        {
          key: 'settings',
          Icon: SettingsIcon,
          i18nKey: 'settings',
          linkTo: '/settings',
          onClick: closeDropdown
        },
        {
          key: 'maximise',
          Icon: MaximiseIcon,
          i18nKey: appEnv.fullPage ? 'openNewTab' : 'maximiseView',
          linkTo: null,
          onClick: handleMaximiseViewClick
        }
      ].filter(Boolean as any as ExcludesFalse),
    [appEnv.fullPage, closeDropdown, handleMaximiseViewClick]
  );

  return (
    <DropdownWrapper
      opened={opened}
      className="origin-top-right"
      style={{
        minWidth: '16rem'
      }}
    >
      <div className="flex items-end mb-2">
        <h3 className={classNames('mx-1', 'flex items-center', 'text-sm text-white text-opacity-90')}>
          <T id="accounts" />
          <PeopleIcon className="ml-1 h-6 w-auto stroke-current" />
        </h3>

        <div className="flex-1" />

        <Button
          className={classNames(
            'px-4 py-1',
            'rounded',
            'border border-white',
            'flex items-center',
            'text-white text-shadow-black',
            'text-sm',
            'hover:bg-white hover:bg-opacity-5',
            'transition duration-300 ease-in-out',
            'opacity-90 hover:opacity-100'
          )}
          onClick={handleLogoutClick}
          testID={AccountDropdownSelectors.LogoutButton}
        >
          <T id="lock" />
        </Button>
      </div>

      <div className={classNames('my-2')}>
        {isShowSearch && (
          <SearchField
            value={searchValue}
            className={classNames(
              'py-2 pl-8 pr-4',
              'bg-transparent',
              'border border-white border-opacity-10',
              'focus:outline-none',
              'transition ease-in-out duration-200',
              'rounded rounded-b-none',
              'text-white text-sm leading-tight'
            )}
            placeholder={t('searchByName')}
            searchIconClassName="h-5 w-auto"
            searchIconWrapperClassName="px-2 text-white opacity-75"
            cleanButtonStyle={{ backgroundColor: 'transparent' }}
            cleanButtonIconStyle={{ stroke: 'white' }}
            onValueChange={setSearchValue}
          />
        )}
        <div
          className={classNames(
            'overflow-y-auto',
            'border border-white border-opacity-10 shadow-inner',
            'rounded',
            isShowSearch && 'border-t-0 rounded-t-none'
          )}
          style={{ maxHeight: '12.5rem' }}
        >
          <div className="flex flex-col">
            {filteredAccounts.length === 0 ? (
              <p className="text-center text-white text-sm p-10">
                <T id="noResults" />
              </p>
            ) : (
              filteredAccounts.map(acc => {
                const selected = acc.publicKeyHash === account.publicKeyHash;
                const handleAccountClick = () => {
                  if (!selected) {
                    setAccountPkh(acc.publicKeyHash);
                  }
                  setOpened(false);
                };

                return (
                  <Button
                    key={acc.publicKeyHash}
                    className={classNames(
                      'block w-full',
                      'overflow-hidden',
                      'flex items-center',
                      'text-white text-shadow-black',
                      'transition ease-in-out duration-200',
                      selected && 'shadow',
                      selected ? 'bg-white bg-opacity-10' : 'hover:bg-white hover:bg-opacity-5',
                      !selected && 'opacity-75 hover:opacity-100'
                    )}
                    style={{
                      padding: '0.375rem'
                    }}
                    onClick={handleAccountClick}
                    testID={AccountDropdownSelectors.AccountItemButton}
                  >
                    <Identicon
                      type="bottts"
                      hash={acc.publicKeyHash}
                      size={32}
                      className="flex-shrink-0 shadow-xs-white"
                    />

                    <div className="flex flex-col items-start ml-2">
                      <Name className="text-sm font-medium leading-none" style={{ paddingBottom: 3 }}>
                        {acc.name}
                      </Name>

                      <div className="flex flex-wrap items-center">
                        <Balance address={acc.publicKeyHash}>
                          {bal => (
                            <span className={classNames('text-xs leading-tight', 'text-white text-opacity-75')}>
                              <Money tooltip={false}>{bal}</Money> <span style={{ fontSize: '0.5rem' }}>tez</span>
                            </span>
                          )}
                        </Balance>

                        <AccountTypeBadge account={acc} darkTheme />
                      </div>
                    </div>
                  </Button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="my-2">
        {actions.map(({ key, Icon, i18nKey, linkTo, onClick }) => {
          const handleClick = () => {
            trackEvent(AccountDropdownSelectors.ActionButton, AnalyticsEventCategory.ButtonPress, { type: key });
            return onClick();
          };

          const baseProps = {
            key,
            className: classNames(
              'block w-full',
              'my-1',
              'rounded overflow-hidden',
              'flex items-center',
              'px-2',
              'transition ease-in-out duration-200',
              'hover:bg-white hover:bg-opacity-10',
              'text-white text-shadow-black text-sm',
              'whitespace-nowrap'
            ),
            style: {
              paddingTop: '0.375rem',
              paddingBottom: '0.375rem'
            },
            onClick: handleClick,
            children: (
              <>
                <div className="flex items-center w-8">
                  <Icon className="w-auto h-6 stroke-current" />
                </div>

                <T id={i18nKey} />
              </>
            )
          };

          return linkTo ? <Link {...baseProps} to={linkTo} /> : <button {...baseProps} />;
        })}
      </div>
    </DropdownWrapper>
  );
};

export default AccountDropdown;
