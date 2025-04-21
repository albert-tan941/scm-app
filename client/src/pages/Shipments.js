import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import { shipments } from '../services/api';

const statusColors = {
  pending: 'warning',
  shipped: 'info',
  in_transit: 'primary',
  delivered: 'success'
};

const Shipments = () => {
  const [shipmentList, setShipmentList] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await shipments.getAll();
      setShipmentList(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch shipments');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, estimated_delivery) => {
    try {
      await shipments.updateStatus(id, { status, estimated_delivery });
      fetchShipments();
      setOpen(false);
    } catch (err) {
      setError('Failed to update shipment');
    }
  };

  const openUpdateDialog = (shipment) => {
    setSelectedShipment(shipment);
    setOpen(true);
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Container>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Shipments
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Estimated Delivery</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shipmentList.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell>{shipment.product_name}</TableCell>
                  <TableCell>{shipment.quantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={shipment.status}
                      color={statusColors[shipment.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {shipment.estimated_delivery
                      ? new Date(shipment.estimated_delivery).toLocaleDateString()
                      : 'Not set'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openUpdateDialog(shipment)}
                    >
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Update Status Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Update Shipment Status</DialogTitle>
        {selectedShipment && (
          <DialogContent>
            <TextField
              select
              margin="dense"
              label="Status"
              fullWidth
              defaultValue={selectedShipment.status}
              onChange={(e) => {
                const newStatus = e.target.value;
                const estimatedDelivery = newStatus === 'shipped' 
                  ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
                  : selectedShipment.estimated_delivery;
                handleUpdateStatus(selectedShipment.id, newStatus, estimatedDelivery);
              }}
              SelectProps={{
                native: true,
              }}
            >
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </TextField>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Shipments; 