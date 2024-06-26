"use client";
import {
  Button,
  Card,
  Image,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import { type ColumnProps } from "antd/es/table";
import dayjs from "dayjs";
import { useState } from "react";
import CareersCrud from "~/app/_components/CareersCrud";
import ProcedenceCrud from "~/app/_components/ProcedenceCrud";
import VolunteersRequests from "~/app/_components/VolunteersRequests";
import { useGlobalContext } from "~/app/state/globalContext";
import { type RouterOutputs } from "~/server/api/root";
import { api } from "~/trpc/react";
import VolunteerAssistence from "./VolunteerAssistence";
type Volunteer = RouterOutputs["volunteer"]["list"][0];
//=>
export default function VolunteerList() {
  const genders = api.person.listGenders.useQuery();
  const [search, setSearch] = useState("");
  const lista = api.volunteer.list.useQuery({
    search,
  });
  const careers = api.career.list.useQuery();
  const finishVolunteer = api.volunteer.finishVolunteer.useMutation({
    onSuccess() {
      void lista.refetch();
      void global?.messageApi.success("Evaluado correctamente");
    },
  });

  const assignCode = api.volunteer.assignCode.useMutation({
    onSuccess() {
      void lista.refetch();
      void global?.messageApi.success("Código asignado");
    },
  });
  const global = useGlobalContext();
  const procedence = api.volunteer.procedences.useQuery();
  const util = api.useUtils();
  const procedenceVolunteer = api.volunteer.procedenceVolunteer.useMutation({
    onSuccess() {
      void util.volunteer.procedences.refetch();
      void util.volunteer.list.refetch();
      void global?.messageApi.success("Procedencia actualizada");
    },
  });
  const careersVolunteer = api.volunteer.careersVolunteer.useMutation({
    onSuccess() {
      void util.volunteer.list.refetch();
      void global?.messageApi.success("Carrera actualizada");
    },
  });
  const columns: ColumnProps<Volunteer>[] = [
    {
      title: "Avatar",
      key: "avatar",
      width: 60,
      render(_, row) {
        return (
          <div>
            <Image alt="avatar" width={40} src={row.user.image ?? ""} />
          </div>
        );
      },
    },
    {
      title: "Nombre",
      key: "name",
      width: 100,
      render(_, row) {
        return (
          <Typography.Text>
            {row.user.person?.name ?? ""} {row.user.person?.f_lastname ?? ""}{" "}
            {row.user.person?.m_lastname ?? ""}
          </Typography.Text>
        );
      },
    },
    {
      title: "Contacto",
      key: "email",
      width: 150,
      render(_, row) {
        return (
          <div className="tw-flex tw-flex-col">
            <Typography.Text>
              {row.user.person?.emails?.map((e) => e.mail).join(", ")}
            </Typography.Text>
            <Typography.Text>
              {row.user.person?.phones?.map((p) => p.phone).join(", ")}
            </Typography.Text>
          </div>
        );
      },
    },
    {
      title: "Habilidades",
      width: 150,
      key: "procedences",
      render(_, row) {
        return row.skills.map((s) => <Tag key={s.id}>{s.name}</Tag>);
      },
    },
    {
      title: "Carrera(s)",
      key: "carrera",
      width: 150,
      render(_, row) {
        return (
          <Select
            loading={careers.isLoading}
            className="tw-w-full"
            mode="multiple"
            placeholder="Carreras"
            options={careers.data?.map((c) => ({
              label: c.name,
              value: c.id,
            }))}
            defaultValue={row.careers.map((c) => c.id)}
            onChange={(v) => {
              void careersVolunteer.mutateAsync({
                id: row.id,
                ids: v,
              });
            }}
          />
        );
      },
    },
    {
      title: "Procedencia(s)",
      key: "procedence",
      width: 150,
      render(_, row) {
        return (
          <Select
            loading={procedence.isLoading}
            className="tw-w-full"
            mode="multiple"
            placeholder="Procedencias"
            options={procedence.data?.map((p) => ({
              label: p.name,
              value: p.id,
            }))}
            defaultValue={row.procedence.map((v) => v.id)}
            onChange={(v) => {
              void procedenceVolunteer.mutateAsync({
                id: row.id,
                ids: v,
              });
            }}
            //value={row.procedence.map((v) => v.id)}
          />
        );
      },
    },
    {
      title: "Codigo de asistencia",
      width: 150,
      key: "assistance_code",
      render(_, row) {
        return (
          <Input
            placeholder="Asigna un codigo de asistencia"
            defaultValue={row.biometric_id ?? ""}
            disabled={assignCode.isPending}
            onKeyDown={(e) => {
              if (e.currentTarget.value === row.biometric_id) return;
              if (e.key === "Enter") {
                void assignCode.mutateAsync({
                  id: row.id,
                  code: e.currentTarget.value,
                });
              }
            }}
            onBlur={(e) => {
              if (e.target.value === row.biometric_id) return;
              void assignCode.mutateAsync({
                id: row.id,
                code: e.target.value,
              });
            }}
          />
        );
      },
    },
    {
      title: "Genero",
      key: "gender",
      width: 80,
      filters: genders.data?.map((g) => ({
        text: g.name,
        value: g.name,
      })),
      onFilter: (value, row) => row.user.person?.gender?.name === value,
      render(_: unknown, row) {
        return <>{row.user.person?.gender?.name ?? "-"}</>;
      },
    },
    {
      title: "Estado",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 100,
      sortDirections: ["descend", "ascend"],
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      render: (_: unknown, volunteer: Volunteer) => {
        return (
          <div>
            <Typography.Text>
              Miembro desde: {dayjs(volunteer.created_at).format("DD/MM/YYYY")}
            </Typography.Text>
            <Tag color={volunteer.status === "ACTIVE" ? "green" : "red"}>
              {volunteer.status === "ACTIVE" ? "Activo" : "Inactivo"}
            </Tag>
            <Tag color={volunteer.user.userType === "GUEST" ? "red" : "green"}>
              {volunteer.user.userType === "VOLUNTEER"
                ? "Voluntario"
                : volunteer.user.userType === "ADMIN"
                  ? "Administrador"
                  : "Invitado"}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Acciones",
      key: "actions",
      width: 100,
      render: (_: unknown, volunteer: Volunteer) => {
        return (
          <div>
            <Button type="primary" size="small">
              Projectos
            </Button>
            <Button type="primary" size="small"
              onClick={() => {
                setModalAsistencia(true);
                setSelectedVolunteerId(volunteer.id);
              }}
            >
              Asistencia
            </Button>
            {volunteer.user.userType !== "GUEST" && (
              <Popconfirm
                title={`¿Estas seguro de finalizar la pasantia de ${volunteer.user.person.name ?? ""}?`}
                onConfirm={() => {
                  void finishVolunteer.mutateAsync(volunteer.id);
                }}
              >
                <Button
                  loading={finishVolunteer.isPending}
                  type="primary"
                  danger
                  size="small"
                >
                  Finalizar
                </Button>
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];
  const [modalProcedence, setModalProcedence] = useState(false);
  const [modalCareers, setModalCareers] = useState(false);
  const [modalAsistencia, setModalAsistencia] = useState(false);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>();
  return (
    // <div className="tw-p-4 tw-h-screen ">
    <>
      <Modal
        title="Asistencia"
        open={modalAsistencia}
        onCancel={() => setModalAsistencia(false)}
        footer={null}
        width={1200}
        destroyOnClose
      >
        {selectedVolunteerId && <VolunteerAssistence id={selectedVolunteerId} />}
      </Modal>
      <Modal
        title="Procedencia"
        open={modalProcedence}
        onCancel={() => setModalProcedence(false)}
        footer={null}
      >
        {/* Crud de procedencia... tabla e input */}
        <ProcedenceCrud />
      </Modal>
      <Modal
        title="Carreras"
        open={modalCareers}
        onCancel={() => setModalCareers(false)}
        footer={null}
      >
        <CareersCrud />
      </Modal>
      <VolunteersRequests />
      <Card
        title={
          <div className="tw-flex tw-items-center tw-gap-2">
            <Typography.Text>Lista de voluntarios</Typography.Text>
            <Button
              type="primary"
              size="small"
              onClick={() => setModalProcedence(true)}
            >
              Procedencia
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => setModalCareers(true)}
            >
              Carreras
            </Button>
          </div>
        }
        size="small"
      >
        <div className="tw-overflow-auto">
          <Input.Search
            size="small"
            placeholder="Buscar por nombre o contacto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Table
            size="small"
            pagination={false}
            scroll={{ y: 500 }}
            virtual
            rowKey={(v) => v.id}
            loading={lista.isLoading}
            dataSource={lista.data}
            columns={columns}
          />
        </div>
      </Card>
    </>
  );
}
