// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'

// Third-party Imports
import classnames from 'classnames'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Styles Imports
import tableStyles from '@core/styles/table.module.css'

// Sample Data (replace with DB fetch later)
const rowsData = [
  {
    patientAvatar: '/images/avatars/1.png',
    patientName: 'Jordan Stevenson',
    patientUsername: '@jordans',
    doctorName: 'Dr. Emily Clark',
    doctorSpecialty: 'Cardiologist',
    doctorIcon: 'ri-stethoscope-line',
    doctorIconClass: 'text-primary',
    appointmentDateTime: '2025-06-01 09:30 AM',
    status: 'confirmed'
  },
  {
    patientAvatar: '/images/avatars/2.png',
    patientName: 'Richard Payne',
    patientUsername: '@richardp',
    doctorName: 'Dr. Sarah Lee',
    doctorSpecialty: 'Dermatologist',
    doctorIcon: 'ri-hospital-line',
    doctorIconClass: 'text-warning',
    appointmentDateTime: '2025-06-01 11:00 AM',
    status: 'pending'
  },
  {
    patientAvatar: '/images/avatars/3.png',
    patientName: 'Jennifer Summers',
    patientUsername: '@jennifers',
    doctorName: 'Dr. Michael Brown',
    doctorSpecialty: 'Neurologist',
    doctorIcon: 'ri-brain-line',
    doctorIconClass: 'text-error',
    appointmentDateTime: '2025-06-02 02:00 PM',
    status: 'cancelled'
  },
  // Add more appointments here
]

const AppointmentsTable = () => {
  return (
    <Card>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rowsData.map((row, index) => (
              <tr key={index}>
                <td className='!plb-1'>
                  <div className='flex items-center gap-3'>
                    <CustomAvatar src={row.patientAvatar} size={34} />
                    <div className='flex flex-col'>
                      <Typography color='text.primary' className='font-medium'>
                        {row.patientName}
                      </Typography>
                      <Typography variant='body2'>{row.patientUsername}</Typography>
                    </div>
                  </div>
                </td>
                <td className='!plb-1'>
                  <div className='flex items-center gap-2'>
                    <i className={classnames(row.doctorIcon, row.doctorIconClass, 'text-[22px]')} />
                    <div className='flex flex-col'>
                      <Typography color='text.primary'>{row.doctorName}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {row.doctorSpecialty}
                      </Typography>
                    </div>
                  </div>
                </td>
                <td className='!plb-1'>
                  <Typography>{row.appointmentDateTime}</Typography>
                </td>
                <td className='!pb-1'>
                  <Chip
                    className='capitalize'
                    variant='tonal'
                    color={
                      row.status === 'pending'
                        ? 'warning'
                        : row.status === 'cancelled'
                        ? 'error'
                        : 'success'
                    }
                    label={row.status}
                    size='small'
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default AppointmentsTable
