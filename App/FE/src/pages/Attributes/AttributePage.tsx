import { useState } from "react";
import { Plus, Trash2, X, Loader2 } from "lucide-react"; // Tambahkan Loader2
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAttributes } from "@/hooks/react-query/useAttributes";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DeleteAlertDialog from "@/components/dialog/DeleteAlertDialog";

export default function AttributePage() {
  // Ambil isCreating dari hook
  const { attributes, isLoading, createAttribute, deleteAttribute, isCreating } =
    useAttributes();
    
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [levels, setLevels] = useState([{ name: "" }]);

  const handleAddLevel = () => setLevels([...levels, { name: "" }]);

  const handleLevelChange = (index: number, value: string) => {
    const newLevels = [...levels];
    newLevels[index].name = value;
    setLevels(newLevels);
  };

  const handleRemoveLevel = (index: number) => {
    setLevels(levels.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      await createAttribute({ name, levels });
      setIsAddOpen(false);
      setName("");
      setLevels([{ name: "" }]);
    } catch (error) {
      // Error sudah dihandle oleh react-query/service biasanya
    }
  };

  if (isLoading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="p-6 space-y-6">
      <PageMeta
        description="Manajemen atribut produk dan level pilihan untuk sistem Gagal Lapar."
        title="Atribut Produk | Gagal Lapar"
      />
      <PageBreadcrumb pageTitle="Atribut Produk" />

      <div className="flex justify-end items-center">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-500 hover:bg-red-600">
              <Plus className="mr-2 h-4 w-4" /> Tambah Atribut
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Atribut Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Atribut</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Level Pedas"
                  disabled={isCreating} // Disable input saat loading
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pilihan / Level</label>
                {levels.map((lvl, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={lvl.name}
                      onChange={(e) => handleLevelChange(index, e.target.value)}
                      placeholder={`Pilihan ${index + 1}`}
                      disabled={isCreating}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveLevel(index)}
                      disabled={isCreating || levels.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleAddLevel}
                  disabled={isCreating}
                >
                  + Tambah Pilihan
                </Button>
              </div>
              
              <Button 
                className="w-full bg-red-500 hover:bg-red-600 disabled:cursor-not-allowed" 
                onClick={handleSubmit} 
                disabled={isCreating || !name.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Atribut"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Daftar Atribut Terdaftar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Atribut</TableHead>
                <TableHead>Level / Pilihan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributes.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                     Belum ada atribut.
                   </TableCell>
                </TableRow>
              ) : (
                attributes.map((attr) => (
                  <TableRow key={attr.id}>
                    <TableCell className="font-medium">{attr.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {attr.levels?.map((lvl) => (
                          <span
                            key={lvl.id}
                            className="bg-secondary px-2 py-1 rounded-md text-xs"
                          >
                            {lvl.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteAlertDialog
                        title={`Hapus atribut ${attr.name}?`}
                        description="Menghapus atribut ini akan menghapus semua level pilihan di dalamnya secara permanen."
                        onConfirm={() => deleteAttribute(attr.id!)}
                      >
                        <Button variant="outline" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </DeleteAlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}