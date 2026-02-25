import { apiClient } from "@/lib/apiClient";
import { useState } from "react";

export const CashierPage = () => {
  // Kita kasih data dummy biar langsung tembus ke PosService
  const [cart, setCart] = useState([
    {
      id: 1, // GANTI: Sesuaikan dengan ID Menu yang ada di DB kamu
      qty: 2,
      selectedAttributes: [] 
    }
  ]);
  const [selectedTable, setSelectedTable] = useState(3); // GANTI: ID Meja yang ada di DB

  const handleTestSubmit = async () => {
    // Logic Mapping murni (Data Palsu tapi format Bener)
    const items = cart.map(item => ({
      menu_id: item.id,
      quantity: item.qty,
      attributes: item.selectedAttributes?.map(a => a.id) || []
    }));

    const payload = {
      order_source: 'cashier_direct',
      order_type: 'dine_in',
      table_id: selectedTable,
      payment_method: 'cash',
      items: items
    };

    try {
      console.log("Sending Payload:", payload);
      const response = await apiClient.post('/transactions', payload);
      
      if(response.status === 201 || response.data.status === 'success') {
         alert("BOOM! Transaction Success via Dummy Data");
         console.log("Response DB:", response.data);
      }
    } catch (err: any) {
      console.error("Error Detail:", err.response?.data);
      alert(err.response?.data?.message || "Check Console");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-xl mb-4">Logic Tester (Tanker Mode)</h1>
      <button 
        onClick={handleTestSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded shadow-lg"
      >
        🚀 Kirim Data Dummy ke DB
      </button>
    </div>
  );
};

export default CashierPage;