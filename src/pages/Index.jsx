import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEnquiry, useAddEnquiry, useUpdateEnquiry, useDeleteEnquiry } from '@/integrations/supabase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Search, Filter, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { CustomPagination } from "@/components/ui/pagination.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Checkbox } from "@/components/ui/checkbox";

const ITEMS_PER_PAGE = 20;

const Index = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(['sno', 'enquiry_id', 'client', 'created_date']);
  const [selectedEnquiries, setSelectedEnquiries] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
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
        toast.success("Enquiry added successfully! You're making great progress!");
        form.reset();
        setIsCreating(false);
        queryClient.invalidateQueries(['enquiry']);
      },
      onError: (error) => {
        toast.error(`Oops! We encountered a small hiccup: ${error.message}. Let's try again!`);
      }
    });
  }, [addMutation, form, queryClient]);

  const handleUpdateEnquiry = useCallback((enquiry) => {
    updateMutation.mutate(enquiry, {
      onSuccess: () => {
        toast.success("Enquiry updated successfully! Your attention to detail is impressive!");
        setEditingEnquiry(null);
        queryClient.invalidateQueries(['enquiry']);
      },
      onError: (error) => {
        toast.error(`We hit a small bump while updating: ${error.message}. Don't worry, we can fix this!`);
      }
    });
  }, [updateMutation, queryClient]);

  const handleDeleteEnquiry = useCallback((id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Enquiry deleted successfully. Your workspace is getting cleaner and more organized!");
        setSelectedEnquiries([]);
        queryClient.invalidateQueries(['enquiry']);
      },
      onError: (error) => {
        toast.error(`We encountered a minor setback while deleting: ${error.message}. Let's give it another shot!`);
      }
    });
  }, [deleteMutation, queryClient]);

  const toggleColumn = (column) => {
    setVisibleColumns(prev => 
      prev.includes(column) ? prev.filter(col => col !== column) : [...prev, column]
    );
  };

  const handleSelectEnquiry = (id) => {
    setSelectedEnquiries(prev => 
      prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]
    );
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(visibleColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setVisibleColumns(items);
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
          {isCreating ? (
            <div>
              <Button onClick={() => setIsCreating(false)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddEnquiry)} className="space-y-4">
                  {Object.keys(enquiries[0] || {}).map(field => {
                    if (!['id', 'sno', 'created_date', 'created_by', 'updated_date', 'updated_by'].includes(field)) {
                      return (
                        <FormField
                          key={field}
                          control={form.control}
                          name={field}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{field}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      );
                    }
                    return null;
                  })}
                  <Button type="submit">Save</Button>
                  <Button type="button" onClick={() => setIsCreating(false)} variant="outline">Cancel</Button>
                </form>
              </Form>
            </div>
          ) : (
            <>
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
                <Button onClick={() => setIsCreating(true)}><Plus className="mr-2 h-4 w-4" /> Create Enquiry</Button>
              </div>
              <div className="mb-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="columns" direction="horizontal">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap gap-2">
                        {visibleColumns.map((column, index) => (
                          <Draggable key={column} draggableId={column} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-gray-200 p-2 rounded"
                              >
                                {column}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <Select onValueChange={toggleColumn}>
                  <SelectTrigger className="w-[180px] mt-2">
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
                    <TableHead>Select</TableHead>
                    {visibleColumns.map(column => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEnquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEnquiries.includes(enquiry.id)}
                          onCheckedChange={() => handleSelectEnquiry(enquiry.id)}
                        />
                      </TableCell>
                      {visibleColumns.map(column => (
                        <TableCell key={column}>
                          {enquiry[column]}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button variant="ghost" onClick={() => setEditingEnquiry(enquiry)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to delete this enquiry?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently remove the enquiry from our records.
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
              <CustomPagination
                className="mt-4"
                currentPage={page}
                totalPages={Math.ceil(filteredEnquiries.length / ITEMS_PER_PAGE)}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
      {editingEnquiry && (
        <Dialog open={!!editingEnquiry} onOpenChange={() => setEditingEnquiry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Enquiry</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(() => handleUpdateEnquiry(editingEnquiry))} className="space-y-4">
                {Object.keys(editingEnquiry).map(field => {
                  if (!['id', 'sno', 'created_date', 'created_by', 'updated_date', 'updated_by'].includes(field)) {
                    return (
                      <FormField
                        key={field}
                        control={form.control}
                        name={field}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel>{field}</FormLabel>
                            <FormControl>
                              <Input 
                                {...formField} 
                                value={editingEnquiry[field]} 
                                onChange={(e) => setEditingEnquiry({...editingEnquiry, [field]: e.target.value})}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    );
                  }
                  return null;
                })}
                <Button type="submit">Save</Button>
                <Button type="button" onClick={() => setEditingEnquiry(null)} variant="outline">Cancel</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Index;
