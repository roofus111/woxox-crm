"use client"
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
import Image from 'next/image'
import woxoxLogo from '@core/svg/woxoxlogo2.0.png'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'
// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

import { useSession } from 'next-auth/react';

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { data: session, status } = useSession();


  const isModuleActive = (moduleId) => {
    if (!session?.user?.plan?.modules?.[0]?.plans?.[0]?.moduleAccess) {
      return false;
    }

    const matchedModule = session.user.plan.modules[0].plans[0].moduleAccess.find(
      item => item.addonId === moduleId && item.isActive
    );

    return !!matchedModule;
  };

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar
  const [pipe, setPipe] = useState([])
  const fetchPipelineMenu = async () => {
    const token = localStorage.getItem('token'); // Replace with your actual token

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/getPipeline`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add the token to the Authorization header
        },
      });

      setPipe(response.data); // Handle the response data
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchPipelineMenu()
  }, [])

  // Show skeleton loader while session is loading
  if (status === "loading") {
    return (
      <Box sx={{ p: 2 }}>
        {/* Team Section Skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="60%" height={34} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={34} />
        </Box>

        {/* Customer Section Skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="50%" height={34} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" height={34} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="60%" height={34} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="80%" height={34} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="55%" height={34} />
        </Box>

        {/* Workflow Section Skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="45%" height={34} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="65%" height={34} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="75%" height={34} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="50%" height={34} />
        </Box>

        {/* Documents Section Skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="40%" height={34} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={34} />
        </Box>

        {/* Finance Section Skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="55%" height={34} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" height={34} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="65%" height={34} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="80%" height={34} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="60%" height={34} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="75%" height={34} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="70%" height={34} />
        </Box>

      </Box>
    );
  }

  return (
    <>
      <ScrollWrapper
        {...(isBreakpointReached
          ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
          : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
      >
        {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
        {/* Vertical Menu */}
        <Menu
          popoutMenuOffset={{ mainAxis: 17 }}
          menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
          renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
          renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
          menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        >
          {/* <SubMenu
      label={'Customers'}
      icon={<i className='ri-account-box-line' />}
    > */}
          {/* <MenuItem href={`/${locale}/manager/customer`}>Contacts</MenuItem> */}
          {/* <MenuItem href={`/${locale}/manager/customer/addcustomer`}>Add</MenuItem> */}
          {/* <MenuItem href={`/${locale}/manager/leadcampaign`}>Campaign</MenuItem> */}
          {/* <MenuItem href={`/${locale}/manager/followup`}>follow Up</MenuItem> */}
          {/* </SubMenu> */}

          <SubMenu
            label={'Team'}
            icon={<i className='ri-group-line' />}
          >
            <MenuItem href={`/${locale}/manager/team`}>Members</MenuItem>
          </SubMenu>
          <MenuSection label={'Customer'}>
            <SubMenu
              label={'Leads'}
              icon={<i className='ri-user-star-line' />}
            >
              <MenuItem href={`/${locale}/manager/addleads`}>Add Leads</MenuItem>
              <MenuItem href={`/${locale}/manager/leads`}>Leads</MenuItem>
              <MenuItem href={`/${locale}/manager/leadcampaign`}>Campaign</MenuItem>
              <MenuItem href={`/${locale}/manager/activitylog`}>Activity Log</MenuItem>
            </SubMenu>
            <SubMenu
              label={'Follow Up'}
              icon={<i className='ri-task-line' />}
            >
              <MenuItem href={`/${locale}/manager/followup/myfollowup?my=true`}>My Schedules</MenuItem>
              <MenuItem href={`/${locale}/manager/followup`}>All Schedules</MenuItem>

            </SubMenu>
            <SubMenu
              label={'Task Manager'}
              icon={<i className='ri-task-line' />}
            >
              {/* <MenuItem href={`/${locale}/manager/followup/myfollowup?my=true`}>My Schedules</MenuItem> */}
              <MenuItem href={`/${locale}/manager/taskmanager`}>My Task</MenuItem>

            </SubMenu>
            <SubMenu
              label={'Tickets'}
              icon={<i className='ri-coupon-2-line' />}
            >
              <MenuItem href={`/${locale}/manager/tickets`}>All Tickets</MenuItem>
              <MenuItem href={`/${locale}/manager/tickets?create=1`}>Create Ticket</MenuItem>
            </SubMenu>
          </MenuSection>
          {isModuleActive('SLM0825') && (
            <MenuSection label={'Sales'}>
              {/* <MenuItem icon={<i className='ri-file-line' />} href={`/${locale}/manager/saleRequest`}>New Sale</MenuItem> */}
              <MenuItem icon={<i className='ri-file-line' />} href={`/${locale}/manager/saleRequest`}>Sales Request</MenuItem>
              <MenuItem icon={<i className='ri-file-line' />} href={`/${locale}/manager/saleRequest/invoice`}>Invoice</MenuItem>
              <MenuItem icon={<i className='ri-file-line' />} href={`/${locale}/manager/saleRequest/transaction`}>History</MenuItem>
            </MenuSection>
          )}

          {isModuleActive('WFM0825') && (
            <MenuSection label={'Workflow'}>
              <SubMenu
                label={'Pipeline'}
                icon={<i className="ri-route-fill" />}
              >
                <SubMenu
                  label={'View'}
                  icon={<i className="ri-home-smile-line" />}

                >
                  {pipe.map((item, index) => (
                    <MenuItem
                      key={index}
                      href={`/${locale}/manager/workflow/${item._id || ''}`}
                    >
                      {item.name || null}
                    </MenuItem>
                  ))}
                </SubMenu>
                <MenuItem href={`/${locale}/manager/pipeline`}>Manage</MenuItem>
              </SubMenu>

              <MenuItem icon={<i className='ri-price-tag-3-line' />} href={`/${locale}/manager/tagSection`}>Tag Manager</MenuItem>
            </MenuSection>
          )}
          <MenuSection label={'Documents'}>
            <MenuItem icon={<i className='ri-folder-3-line' />} href={`/${locale}/manager/myfiles`}>
              Files & Folders
            </MenuItem>
            <MenuItem icon={<i className='ri-file-edit-line' />} href={`/${locale}/manager/doceditor`}>
              Document Editor
            </MenuItem>
            <MenuItem icon={<i className='ri-file-copy-2-line' />} href={`/${locale}/manager/doctemplate`}>
              Templates
            </MenuItem>
            <MenuItem icon={<i className='ri-sticky-note-line' />} href={`/${locale}/manager/notes`}>
              Notes
            </MenuItem>
          </MenuSection>
          {/* Finance & HRMS are separate WOXOX products — see Product switcher */}







          {/* <SubMenu
            label={'Finance'}
            icon={<i className='ri-home-smile-line' />}
          // suffix={<Chip label='5' size='small' color='error' />}
          >
            <MenuItem href={`/${locale}/manager/finance`}>Dashboard</MenuItem>
            <MenuItem href={`/${locale}/manager/saleRequest`}>Sales Request</MenuItem>
            <MenuItem href={`/${locale}/manager/saleRequest/invoice`}>Invoice</MenuItem>
            <MenuItem href={`/${locale}/manager/saleRequest/transaction`}>Transaction</MenuItem>
          </SubMenu> */}
          <SubMenu
            label={dictionary['navigation'].dashboards}
            icon={<i className='ri-home-smile-line' />}
            suffix={<Chip label='5' size='small' color='error' />}
          >
            <MenuItem href={`/${locale}/dashboards/crm`}>{dictionary['navigation'].crm}</MenuItem>
            <MenuItem href={`/${locale}/dashboards/analytics`}>{dictionary['navigation'].analytics}</MenuItem>
            <MenuItem href={`/${locale}/dashboards/ecommerce`}>{dictionary['navigation'].eCommerce}</MenuItem>
            <MenuItem href={`/${locale}/dashboards/academy`}>{dictionary['navigation'].academy}</MenuItem>
            <MenuItem href={`/${locale}/dashboards/logistics`}>{dictionary['navigation'].logistics}</MenuItem>
          </SubMenu>
          <SubMenu label={dictionary['navigation'].frontPages} icon={<i className='ri-file-copy-line' />}>
            <MenuItem href='/front-pages/landing-page' target='_blank'>
              {dictionary['navigation'].landing}
            </MenuItem>
            <MenuItem href='/front-pages/pricing' target='_blank'>
              {dictionary['navigation'].pricing}
            </MenuItem>
            <MenuItem href='/front-pages/payment' target='_blank'>
              {dictionary['navigation'].payment}
            </MenuItem>
            <MenuItem href='/front-pages/checkout' target='_blank'>
              {dictionary['navigation'].checkout}
            </MenuItem>
            <MenuItem href='/front-pages/help-center' target='_blank'>
              {dictionary['navigation'].helpCenter}
            </MenuItem>
          </SubMenu>
          <MenuSection label={dictionary['navigation'].appsPages}>
            <SubMenu label={dictionary['navigation'].eCommerce} icon={<i className='ri-shopping-bag-3-line' />}>
              <MenuItem href={`/${locale}/apps/ecommerce/dashboard`}>{dictionary['navigation'].dashboard}</MenuItem>
              <SubMenu label={dictionary['navigation'].products}>
                <MenuItem href={`/${locale}/apps/ecommerce/products/list`}>{dictionary['navigation'].list}</MenuItem>
                <MenuItem href={`/${locale}/apps/ecommerce/products/add`}>{dictionary['navigation'].add}</MenuItem>
                <MenuItem href={`/${locale}/apps/ecommerce/products/category`}>
                  {dictionary['navigation'].category}
                </MenuItem>
              </SubMenu>
              <SubMenu label={dictionary['navigation'].orders}>
                <MenuItem href={`/${locale}/apps/ecommerce/orders/list`}>{dictionary['navigation'].list}</MenuItem>
                <MenuItem
                  href={`/${locale}/apps/ecommerce/orders/details/5434`}
                  exactMatch={false}
                  activeUrl='/apps/ecommerce/orders/details'
                >
                  {dictionary['navigation'].details}
                </MenuItem>
              </SubMenu>
              <SubMenu label={dictionary['navigation'].customers}>
                <MenuItem href={`/${locale}/apps/ecommerce/customers/list`}>{dictionary['navigation'].list}</MenuItem>
                <MenuItem
                  href={`/${locale}/apps/ecommerce/customers/details/879861`}
                  exactMatch={false}
                  activeUrl='/apps/ecommerce/customers/details'
                >
                  {dictionary['navigation'].details}
                </MenuItem>
              </SubMenu>
              <MenuItem href={`/${locale}/apps/ecommerce/manage-reviews`}>
                {dictionary['navigation'].manageReviews}
              </MenuItem>
              <MenuItem href={`/${locale}/apps/ecommerce/referrals`}>{dictionary['navigation'].referrals}</MenuItem>
              <MenuItem href={`/${locale}/apps/ecommerce/settings`}>{dictionary['navigation'].settings}</MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].academy} icon={<i className='ri-graduation-cap-line' />}>
              <MenuItem href={`/${locale}/apps/academy/dashboard`}>{dictionary['navigation'].dashboard}</MenuItem>
              <MenuItem href={`/${locale}/apps/academy/my-courses`}>{dictionary['navigation'].myCourses}</MenuItem>
              <MenuItem href={`/${locale}/apps/academy/course-details`}>
                {dictionary['navigation'].courseDetails}
              </MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].logistics} icon={<i className='ri-car-line' />}>
              <MenuItem href={`/${locale}/apps/logistics/dashboard`}>{dictionary['navigation'].dashboard}</MenuItem>
              <MenuItem href={`/${locale}/apps/logistics/fleet`}>{dictionary['navigation'].fleet}</MenuItem>
            </SubMenu>
            <MenuItem
              href={`/${locale}/apps/email`}
              icon={<i className='ri-mail-open-line' />}
              exactMatch={false}
              activeUrl='/apps/email'
            >
              {dictionary['navigation'].email}
            </MenuItem>
            <MenuItem href={`/${locale}/apps/chat`} icon={<i className='ri-wechat-line' />}>
              {dictionary['navigation'].chat}
            </MenuItem>
            <MenuItem href={`/${locale}/apps/calendar`} icon={<i className='ri-calendar-line' />}>
              {dictionary['navigation'].calendar}
            </MenuItem>
            {/* <MenuItem href={`/${locale}/apps/kanban`} icon={<i className='ri-drag-drop-line' />}>
              {dictionary['navigation'].kanban}
            </MenuItem> */}
            <SubMenu label={dictionary['navigation'].invoice} icon={<i className='ri-bill-line' />}>
              <MenuItem href={`/${locale}/apps/invoice/list`}>{dictionary['navigation'].list}</MenuItem>
              <MenuItem
                href={`/${locale}/apps/invoice/preview/4987`}
                exactMatch={false}
                activeUrl='/apps/invoice/preview'
              >
                {dictionary['navigation'].preview}
              </MenuItem>
              <MenuItem href={`/${locale}/apps/invoice/edit/4987`} exactMatch={false} activeUrl='/apps/invoice/edit'>
                {dictionary['navigation'].edit}
              </MenuItem>
              <MenuItem href={`/${locale}/apps/invoice/add`}>{dictionary['navigation'].add}</MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].user} icon={<i className='ri-user-line' />}>
              <MenuItem href={`/${locale}/apps/user/list`}>{dictionary['navigation'].list}</MenuItem>
              <MenuItem href={`/${locale}/apps/user/view`}>{dictionary['navigation'].view}</MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].rolesPermissions} icon={<i className='ri-lock-2-line' />}>
              <MenuItem href={`/${locale}/apps/roles`}>{dictionary['navigation'].roles}</MenuItem>
              <MenuItem href={`/${locale}/apps/permissions`}>{dictionary['navigation'].permissions}</MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].pages} icon={<i className='ri-layout-left-line' />}>
              <MenuItem href={`/${locale}/pages/user-profile`}>{dictionary['navigation'].userProfile}</MenuItem>
              <MenuItem href={`/${locale}/pages/account-settings`}>{dictionary['navigation'].accountSettings}</MenuItem>
              <MenuItem href={`/${locale}/pages/faq`}>{dictionary['navigation'].faq}</MenuItem>
              <MenuItem href={`/${locale}/pages/pricing`}>{dictionary['navigation'].pricing}</MenuItem>
              <SubMenu label={dictionary['navigation'].miscellaneous}>
                <MenuItem href={`/${locale}/pages/misc/coming-soon`} target='_blank'>
                  {dictionary['navigation'].comingSoon}
                </MenuItem>
                <MenuItem href={`/${locale}/pages/misc/under-maintenance`} target='_blank'>
                  {dictionary['navigation'].underMaintenance}
                </MenuItem>
                <MenuItem href={`/${locale}/pages/misc/404-not-found`} target='_blank'>
                  {dictionary['navigation'].pageNotFound404}
                </MenuItem>
                <MenuItem href={`/${locale}/pages/misc/401-not-authorized`} target='_blank'>
                  {dictionary['navigation'].notAuthorized401}
                </MenuItem>
              </SubMenu>
            </SubMenu>
            {/* <SubMenu label={dictionary['navigation'].authPages} icon={<i className='ri-shield-keyhole-line' />}>
              <SubMenu label={dictionary['navigation'].login}>
                <MenuItem href={`/${locale}/pages/auth/login-v1`} target='_blank'>
                  {dictionary['navigation'].loginV1}
                </MenuItem>
                <MenuItem href={`/${locale}/pages/auth/login-v2`} target='_blank'>
                  {dictionary['navigation'].loginV2}
                </MenuItem>
              </SubMenu>
              <SubMenu label={dictionary['navigation'].register}>
                <MenuItem href={`/${locale}/pages/auth/register-v1`} target='_blank'>
                  {dictionary['navigation'].registerV1}
                </MenuItem>
                <MenuItem href={`/${locale}/pages/auth/register-v2`} target='_blank'>
                  {dictionary['navigation'].registerV2}
                </MenuItem>
                <MenuItem href={`/${locale}/pages/auth/register-multi-steps`} target='_blank'>
                  {dictionary['navigation'].registerMultiSteps}
                </MenuItem>
              </SubMenu>
              <SubMenu label={dictionary['navigation'].verifyEmail}>
                <MenuItem href={`/${locale}/pages/auth/verify-email-v1`} target='_blank'>
                  {dictionary['navigation'].verifyEmailV1}
                </MenuItem>
                <MenuItem href={`/${locale}/pages/auth/verify-email-v2`} target='_blank'>
                  {dictionary['navigation'].verifyEmailV2}
                </MenuItem>
              </SubMenu>
              <SubMenu label={dictionary['navigation'].forgotPassword}>
                <MenuItem href={`/${locale}/pages/auth/forgot-password-v1`} target='_blank'>
                  {dictionary['navigation'].forgotPasswordV1}
                </MenuItem>
                <MenuItem href={`/${locale}/pages/auth/forgot-password-v2`} target='_blank'>
                  {dictionary['navigation'].forgotPasswordV2}
                </MenuItem>
              </SubMenu>
              <SubMenu label={dictionary['navigation'].resetPassword}>
                <MenuItem href={`/${locale}/pages/auth/reset-password-v1`} target='_blank'>
                  {dictionary['navigation'].resetPasswordV1}
                </MenuItem>
                <MenuItem href={`/${locale}/pages/auth/reset-password-v2`} target='_blank'>
                  {dictionary['navigation'].resetPasswordV2}
                </MenuItem>
              </SubMenu>
              <SubMenu label={dictionary['navigation'].twoSteps}>
                <MenuItem href={`/${locale}/pages/auth/two-steps-v1`} target='_blank'>
                  {dictionary['navigation'].twoStepsV1}
                </MenuItem>
                <MenuItem href={`/${locale}/pages/auth/two-steps-v2`} target='_blank'>
                  {dictionary['navigation'].twoStepsV2}
                </MenuItem>
              </SubMenu>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].wizardExamples} icon={<i className='ri-git-commit-line' />}>
              <MenuItem href={`/${locale}/pages/wizard-examples/checkout`}>{dictionary['navigation'].checkout}</MenuItem>
              <MenuItem href={`/${locale}/pages/wizard-examples/property-listing`}>
                {dictionary['navigation'].propertyListing}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/wizard-examples/create-deal`}>
                {dictionary['navigation'].createDeal}
              </MenuItem>
            </SubMenu>
            <MenuItem href={`/${locale}/pages/dialog-examples`} icon={<i className='ri-tv-2-line' />}>
              {dictionary['navigation'].dialogExamples}
            </MenuItem>
            <SubMenu label={dictionary['navigation'].widgetExamples} icon={<i className='ri-bar-chart-box-line' />}>
              <MenuItem href={`/${locale}/pages/widget-examples/basic`}>{dictionary['navigation'].basic}</MenuItem>
              <MenuItem href={`/${locale}/pages/widget-examples/advanced`}>{dictionary['navigation'].advanced}</MenuItem>
              <MenuItem href={`/${locale}/pages/widget-examples/statistics`}>
                {dictionary['navigation'].statistics}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/widget-examples/charts`}>{dictionary['navigation'].charts}</MenuItem>
              <MenuItem href={`/${locale}/pages/widget-examples/gamification`}>
                {dictionary['navigation'].gamification}
              </MenuItem>
              <MenuItem href={`/${locale}/pages/widget-examples/actions`}>{dictionary['navigation'].actions}</MenuItem>
            </SubMenu>
          </MenuSection>
          <MenuSection label={dictionary['navigation'].formsAndTables}>
            <MenuItem href={`/${locale}/forms/form-layouts`} icon={<i className='ri-layout-4-line' />}>
              {dictionary['navigation'].formLayouts}
            </MenuItem>
            <MenuItem href={`/${locale}/forms/form-validation`} icon={<i className='ri-checkbox-multiple-line' />}>
              {dictionary['navigation'].formValidation}
            </MenuItem>
            <MenuItem href={`/${locale}/forms/form-wizard`} icon={<i className='ri-git-commit-line' />}>
              {dictionary['navigation'].formWizard}
            </MenuItem>
            <MenuItem href={`/${locale}/react-table`} icon={<i className='ri-table-alt-line' />}>
              {dictionary['navigation'].reactTable}
            </MenuItem>
            <MenuItem
              href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/form-elements`}
              suffix={<i className='ri-external-link-line text-xl' />}
              target='_blank'
              icon={<i className='ri-radio-button-line' />}
            >
              {dictionary['navigation'].formELements}
            </MenuItem>
            <MenuItem
              href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/mui-table`}
              suffix={<i className='ri-external-link-line text-xl' />}
              target='_blank'
              icon={<i className='ri-table-2' />}
            >
              {dictionary['navigation'].muiTables}
            </MenuItem>
          </MenuSection>
          <MenuSection label={dictionary['navigation'].chartsMisc}>
            <SubMenu label={dictionary['navigation'].charts} icon={<i className='ri-bar-chart-2-line' />}>
              <MenuItem href={`/${locale}/charts/apex-charts`}>{dictionary['navigation'].apex}</MenuItem>
              <MenuItem href={`/${locale}/charts/recharts`}>{dictionary['navigation'].recharts}</MenuItem>
            </SubMenu>
            <MenuItem
              href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/foundation`}
              suffix={<i className='ri-external-link-line text-xl' />}
              target='_blank'
              icon={<i className='ri-pantone-line' />}
            >
              {dictionary['navigation'].foundation}
            </MenuItem>
            <MenuItem
              href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/components`}
              suffix={<i className='ri-external-link-line text-xl' />}
              target='_blank'
              icon={<i className='ri-toggle-line' />}
            >
              {dictionary['navigation'].components}
            </MenuItem>
            <MenuItem
              href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/menu-examples/overview`}
              suffix={<i className='ri-external-link-line text-xl' />}
              target='_blank'
              icon={<i className='ri-menu-search-line' />}
            >
              {dictionary['navigation'].menuExamples}
            </MenuItem>
            <MenuItem
              href='https://pixinvent.ticksy.com'
              suffix={<i className='ri-external-link-line text-xl' />}
              target='_blank'
              icon={<i className='ri-lifebuoy-line' />}
            >



              {dictionary['navigation'].raiseSupport}
            </MenuItem>
            <MenuItem
              href='https://demos.pixinvent.com/materialize-nextjs-admin-template/documentation'
              suffix={<i className='ri-external-link-line text-xl' />}
              target='_blank'
              icon={<i className='ri-book-line' />}
            >
              {dictionary['navigation'].documentation}
            </MenuItem>
            <SubMenu label={dictionary['navigation'].others} icon={<i className='ri-more-line' />}>
              <MenuItem suffix={<Chip label='New' size='small' color='info' />}>
                {dictionary['navigation'].itemWithBadge}
              </MenuItem>
              <MenuItem
                href='https://pixinvent.com'
                target='_blank'
                suffix={<i className='ri-external-link-line text-xl' />}
              >
                {dictionary['navigation'].externalLink}
              </MenuItem>
              <SubMenu label={dictionary['navigation'].menuLevels}>
                <MenuItem>{dictionary['navigation'].menuLevel2}</MenuItem>
                <SubMenu label={dictionary['navigation'].menuLevel2}>
                  <MenuItem>{dictionary['navigation'].menuLevel3}</MenuItem>
                  <MenuItem>{dictionary['navigation'].menuLevel3}</MenuItem>
                </SubMenu>
              </SubMenu>
              <MenuItem disabled>{dictionary['navigation'].disabledMenu}</MenuItem>
            </SubMenu> */}
          </MenuSection>











        </Menu>
        {/* <Menu
      popoutMenuOffset={{ mainAxis: 17 }}
      menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
      renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
      renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
      menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
    >
      <GenerateVerticalMenu menuData={menuData(dictionary, params)} />
    </Menu> */}
      </ScrollWrapper>
      <div className='rounded m-2' style={{ display: 'fixed', flexDirection: 'column', height: 'auto', marginTop: 'auto', paddingTop: '3px', border: '1px solid rgba(0,0,0,0.12)', boxShadow: '0 0 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <Menu
          popoutMenuOffset={{ mainAxis: 17 }}
          menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
          renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
          renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
          menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}

        >
          {/* <MenuSection label={'Settings'}>
            <MenuItem icon={<i className='ri-settings-3-line' />} href={`/${locale}/manager/settings`}>
              General Settings
            </MenuItem>
            <MenuItem icon={<i className='ri-user-settings-line' />} href={`/${locale}/manager/profile`}>
              Profile
            </MenuItem>
            <MenuItem icon={<i className='ri-shield-keyhole-line' />} href={`/${locale}/manager/security`}>
              Security
            </MenuItem>
          </MenuSection>

          <MenuSection label={'Support'}>
            <MenuItem icon={<i className='ri-question-line' />} href={`/${locale}/manager/help`}>
              Help Center
            </MenuItem>
            <MenuItem icon={<i className='ri-customer-service-2-line' />} href={`/${locale}/manager/contact`}>
              Contact Support
            </MenuItem>
            <MenuItem icon={<i className='ri-book-open-line' />} href={`/${locale}/manager/docs`}>
              Documentation
            </MenuItem>
          </MenuSection> */}


          {/* <MenuSection label={'Account'} > */}
          <MenuItem icon={<i className='ri-shopping-bag-line' />} href={`/${locale}/manager/marketplace`}>
            Marketplace
          </MenuItem>
          <SubMenu
            label={'Account'}
            icon={<i className='ri-user-settings-line' />}
          >
            <MenuItem href={`/${locale}/manager/subscription`}>Subscription</MenuItem>
            {/* <MenuItem href={`/${locale}/manager/addleads`}>Add Leads</MenuItem>
            <MenuItem href={`/${locale}/manager/leads`}>Leads</MenuItem>
            <MenuItem href={`/${locale}/manager/leadcampaign`}>Campaign</MenuItem>
            <MenuItem className='text-red-500' href={`/${locale}/manager/logout`}>Logout</MenuItem> */}
          </SubMenu>
          {/* </MenuSection> */}
        </Menu>
      </div>
      <p style={{ fontSize: '9px', color: 'gray', padding: '3px', textAlign: 'center' }}>Version 1.0.0 <a href="">Whats new?</a> </p>
    </>
  )
}

export default VerticalMenu
