import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Search,
  Download,
  UserPlus,
  FileSpreadsheet,
} from "lucide-react";
import { studentService } from "@/services/studentService";
import BulkImportModal from "./BulkImportModal";
import AddStudentModal from "./AddStudentModal";
import InviteStudentModal from "./InviteStudentModal";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function getPageNumbers(current, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, current, current - 1, current + 1]);
  return [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    avgCompletion: 0,
  });
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll({ page, limit, search });
      setStudents(res.data.students || []);
      setPagination(res.data.pagination || { page, limit, total: 0, totalPages: 0 });
      setStats(
        res.data.stats || { total: 0, active: 0, avgCompletion: 0 }
      );
    } catch (err) {
      console.error(err);
      setStudents([]);
      setPagination({ page: 1, limit, total: 0, totalPages: 0 });
      setStats({ total: 0, active: 0, avgCompletion: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleExport = () => {
    const csv = [
      ["Name", "Email", "Enrolled", "Completed", "Progress", "Joined", "Status"],
      ...students.map((s) => [
        s.name,
        s.email,
        s.enrolled,
        s.completed,
        s.progress,
        s.joined,
        s.status,
      ]),
    ];

    const blob = new Blob([csv.map((r) => r.join(",")).join("\n")], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_page_${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { total, totalPages } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  const refreshList = () => {
    if (page !== 1) {
      setPage(1);
    } else {
      loadStudents();
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <p className="text-gray-500 text-sm">
            Track every learner&apos;s progress across your platform.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!students.length}
            title="Exports current page only"
          >
            <Download className="w-4 h-4" /> Export page
          </Button>

          <Button variant="outline" onClick={() => setShowImport(true)}>
            <FileSpreadsheet className="w-4 h-4" /> Bulk import
          </Button>

          <Button
            onClick={() => setShowAdd(true)}
            className="bg-purple-600 text-white"
          >
            <UserPlus className="w-4 h-4" /> Add student
          </Button>

          <Button variant="outline" onClick={() => setShowInvite(true)}>
            <UserPlus className="w-4 h-4" /> Invite link
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Total students</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold">{stats.active}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Avg. completion rate</p>
            <p className="text-2xl font-bold">{stats.avgCompletion}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Rows per page</span>
              <Select
                value={String(limit)}
                onValueChange={(v) => {
                  setLimit(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[80px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <p className="p-8 text-center text-gray-400">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="p-8 text-center text-gray-400">
              {search
                ? "No students match your search."
                : "No students yet. Students appear here when added manually or when they sign in with Google."}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {students.map((s) => (
                    <TableRow key={`${s.accountType || "password"}-${s.id}`}>
                      <TableCell>
                        <div className="flex gap-3 items-center">
                          {s.avatar ? (
                            <img
                              src={s.avatar}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold">
                              {s.name?.[0] || "?"}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{s.name}</p>
                              {s.googleLogin && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  Google
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{s.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{s.enrolled}</TableCell>
                      <TableCell>{s.completed}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={s.progress} className="h-2" />
                          <span className="text-xs">{s.progress}%</span>
                        </div>
                      </TableCell>

                      <TableCell>{s.joined}</TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            s.status === "Active" ? "default" : "secondary"
                          }
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
                <p className="text-sm text-gray-500">
                  Showing {from}–{to} of {total} student{total !== 1 ? "s" : ""}
                </p>

                {totalPages > 1 && (
                  <Pagination className="mx-0 w-auto justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) setPage(page - 1);
                          }}
                          className={
                            page <= 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {pageNumbers.map((p, i) => {
                        const prev = pageNumbers[i - 1];
                        const showEllipsis = prev && p - prev > 1;
                        return (
                          <span key={p} className="flex items-center">
                            {showEllipsis && (
                              <span className="px-2 text-muted-foreground">
                                …
                              </span>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                isActive={p === page}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPage(p);
                                }}
                                className="cursor-pointer"
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          </span>
                        );
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < totalPages) setPage(page + 1);
                          }}
                          className={
                            page >= totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showImport && (
        <BulkImportModal
          onClose={() => setShowImport(false)}
          onSuccess={refreshList}
        />
      )}

      {showAdd && (
        <AddStudentModal
          onClose={() => setShowAdd(false)}
          onSuccess={refreshList}
        />
      )}

      {showInvite && (
        <InviteStudentModal
          onClose={() => setShowInvite(false)}
          onSuccess={refreshList}
        />
      )}
    </div>
  );
}
