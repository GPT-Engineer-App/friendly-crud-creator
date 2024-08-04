import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEnquiry, useAddEnquiry, useUpdateEnquiry, useDeleteEnquiry } from '@/integrations/supabase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

const ITEMS_PER_PAGE = 20;

const Index = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(['sno', 'enquiry_id', 'client', 'created_date']);
  const queryClient = useQueryClient();

  const { data: enquiries = [], isLoading, isError, error } = useEnquiry();

  const filteredEnquiries = useMemo(() => {
    if (!enquiries) return [];
    return enquiries.filter(enquiry => 
      (search === '' || Object.values(enquiry).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(search.toLowerCase())
      )) &&
      (!dateFilter || new Date(enquiry.created_date).toDateString() === dateFilter.toDateString())
    );
  }, [enquiries, search, dateFilter]);

  const paginatedEnquiries = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredEnquiries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEnquiries, page]);

  const addMutation = useAddEnquiry();
  const updateMutation = useUpdateEnquiry();
  const deleteMutation = useDeleteEnquiry();

  const form = useForm({
    defaultValues: {
      sno: '',
      enquiry_id: '',
      client: '',
      // Add other fields here
    }
  });

  const handleAddEnquiry = useCallback((data) => {
    addMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Enquiry added successfully! Great job!");
        form.reset();
        queryClient.invalidateQueries(['enquiry']);
      },
      onError: (error) => {
        toast.error(`Oops! Something went wrong: ${error.message}`);
      }
    });
  }, [addMutation, form, queryClient]);

  const handleUpdateEnquiry = useCallback((enquiry) => {
    updateMutation.mutate(enquiry, {
      onSuccess: () => {
        toast.success("Enquiry updated successfully! You're on a roll!");
        setEditingEnquiry(null);
        queryClient.invalidateQueries(['enquiry']);
      },
      onError: (error) => {
        toast.error(`Uh-oh! We couldn't update the enquiry: ${error.message}`);
      }
    });
  }, [updateMutation, queryClient]);

  const handleDeleteEnquiry = useCallback((id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Enquiry deleted successfully. Cleaning up like a pro!");
        queryClient.invalidateQueries(['enquiry']);
      },
      onError: (error) => {
        toast.error(`We hit a snag while deleting: ${error.message}`);
      }
    });
  }, [deleteMutation, queryClient]);

  const toggleColumn = (column) => {
    setVisibleColumns(prev => 
      prev.includes(column) ? prev.filter(col => col !== column) : [...prev, column]
    );
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (isError) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error.message}</div>;

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Enquiry Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search enquiries"
                className="max-w-sm"
              />
              <DatePicker
                selected={dateFilter}
                onChange={setDateFilter}
                placeholderText="Filter by date"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Enquiry</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Enquiry</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddEnquiry)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="client"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {/* Add other form fields here */}
                    <Button type="submit">Submit</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mb-4">
            <Select onValueChange={toggleColumn}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toggle columns" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(enquiries[0] || {}).map(column => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map(column => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEnquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  {visibleColumns.map(column => (
                    <TableCell key={column}>
                      {editingEnquiry?.id === enquiry.id ? (
                        <Input
                          value={editingEnquiry[column]}
                          onChange={(e) => setEditingEnquiry({ ...editingEnquiry, [column]: e.target.value })}
                          disabled={['sno', 'created_date', 'created_by', 'updated_date', 'updated_by'].includes(column)}
                        />
                      ) : (
                        enquiry[column]
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    {editingEnquiry?.id === enquiry.id ? (
                      <Button onClick={() => handleUpdateEnquiry(editingEnquiry)}>Save</Button>
                    ) : (
                      <Button variant="ghost" onClick={() => setEditingEnquiry(enquiry)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the enquiry.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteEnquiry(enquiry.id)}>
                            Yes, delete enquiry
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            className="mt-4"
            currentPage={page}
            totalPages={Math.ceil(filteredEnquiries.length / ITEMS_PER_PAGE)}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
