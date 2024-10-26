import Award from '@views/user/award'
import Grid from '@mui/material/Grid'

const DashboardCRM = async () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={4}>
        <Award />
      </Grid>
      <Grid item xs={12} sm={3} md={2}>
        {/* <CardStatVertical
          stats='155k'
          title='Total Orders'
          trendNumber='22%'
          chipText='Last 4 Month'
          avatarColor='primary'
          avatarIcon='ri-shopping-cart-line'
          avatarSkin='light'
          chipColor='secondary'
        /> */}
      </Grid>
      <Grid item xs={12} sm={3} md={2}>
        {/* <CardStatVertical
          stats='$13.4k'
          title='Total Sales'
          trendNumber='38%'
          chipText='Last Six Months'
          avatarColor='success'
          avatarIcon='ri-handbag-line'
          avatarSkin='light'
          chipColor='secondary'
        /> */}
      </Grid>
      <Grid item xs={12} sm={3} md={2}>
        {/* <StackedBarChart /> */}
      </Grid>
      <Grid item xs={12} sm={3} md={2}>
        {/* <DonutChart /> */}
      </Grid>
      <Grid item xs={12} md={4}>
        {/* <OrganicSessions /> */}
      </Grid>
      <Grid item xs={12} md={8}>
        {/* <ProjectTimeline /> */}
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        {/* <WeeklyOverview /> */}
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        {/* <SocialNetworkVisits /> */}
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        {/* <MonthlyBudget /> */}
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        {/* <MeetingSchedule /> */}
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        {/* <ExternalLinks /> */}
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        {/* <PaymentHistory serverMode={serverMode} /> */}
      </Grid>
      <Grid item xs={12} md={4}>
        {/* <SalesInCountries /> */}
      </Grid>
      <Grid item xs={12} md={8}>
        {/* <UserTable tableData={data} /> */}
      </Grid>
    </Grid>
  )
}

export default DashboardCRM
