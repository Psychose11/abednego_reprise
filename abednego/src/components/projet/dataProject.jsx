import * as React from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Menu } from "primereact/menu";
import { visuallyHidden } from "@mui/utils";
import { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import QuestionnaireDialog from "./proTable";

const ip = process.env.REACT_APP_IP;

const headCells = [
  { id: "idProjet", label: "identifiant" },
  { id: "nomProjet", label: "Nom du projet" },
  { id: "typeProjet", label: "Type du projet" },
  { id: "dateCreation", label: "Date de création" },
  { id: "progression", label: "Progression" },
];

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) =>
    onRequestSort(event, property);

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "select all users" }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function EnhancedTableToolbar(props) {
  const { numSelected, onDeleteClick, onEditClick, onSearch } = props;
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
    onSearch(event.target.value);
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Listes des projets
        </Typography>
      )}

      {numSelected > 0 ? (
        <div style={{ display: "flex" }}>
          <Tooltip title="Edit">
            <IconButton onClick={onEditClick}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={onDeleteClick}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      ) : (
        <Tooltip title="Filter list"></Tooltip>
      )}

      <span className="p-input-icon-left">
        <i className="pi pi-search" />

        <InputText
          type="search"
          placeholder="Rechercher..."
          value={searchValue}
          onChange={handleSearchChange}
        />
      </span>
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onEditClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function formaterDate(dateString) {
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'UTC', // Indiquer que la date est en temps universel (UTC)
  };

  const date = new Date(dateString);
  const dateFormatee = date.toLocaleString('fr-FR', options); // 'fr-FR' pour le format français, ajustez selon vos besoins

  return dateFormatee;
}

export default function EnhancedTable() {
  const [projet, setProjet] = useState([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("idProjet");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchValue, setSearchValue] = useState("");
  const toast = useRef(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const menuRef = useRef(null);

  const menuItems = [
    {
      label: "Pro",
      icon: "pi pi-fw pi-table",
      command: () => handleMenuClick("action2"),
    },
  ];

  const handleMenuClick = (action) => {
    // Utilisez selectedItemId pour effectuer des actions sur la ligne sélectionnée
    console.log(
      `Action ${action} sur la ligne avec l'identifiant ${selectedItemId}`
    );
   

    setDialogVisible(true);
    // Réinitialisez l'état
    setMenuVisible(false);
    setSelectedItemId(null);
  };

  // Fonction pour ouvrir la boîte de dialogue
  const showProjectDialog = () => {
    setDialogVisible(true);
  };

  // Fonction pour fermer la boîte de dialogue
  const hideProjectDialog = () => {
    setDialogVisible(false);
  };

  const handleContextMenu = (event, id) => {
    event.preventDefault();
    setMenuVisible(true);
    setSelectedItemId(id);
    menuRef.current.show(event);
  };

  const handleOutsideClick = () => {
    setMenuVisible(false);
    setSelectedItemId(null);
  };

  const [selectedProspecteur, setSelectedProspecteur] = useState(null);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    setSelected([]);
  };

  const handleEditClick = () => {
    if (selected.length === 1) {
      const selectedProspecteur = projet.find((p) => p.id === selected[0]);

      setSelectedProspecteur(selectedProspecteur);
    } else {
      console.warn("Sélectionnez une seule ligne pour l'édition.");
    }
  };

  const showSuccess = () => {
    toast.current.show({
      severity: "success",
      summary: "Suppression effectué",
      detail: "Le prospecteur a bien été supprimer",
      sticky: true,
    });
  };

  const showError = () => {
    toast.current.show({
      severity: "error",
      summary: "Erreur",
      detail: "Erreur de suppression du prospecteur",
      life: 3000,
    });
  };

  const showExistant = () => {
    toast.current.show({
      severity: "error",
      summary: "Ustilisateur non existant",
      detail: "L'utilisateur n'existe pas",
      life: 3000,
    });
  };

  const handleDeleteClick = async () => {
    if (selected.length > 0) {
      const selectedProspecteurs = selected.map((id) =>
        projet.find((p) => p.id === id)
      );
      console.log(
        "Informations sur les lignes sélectionnées pour la suppression :",
        selectedProspecteurs
      );

      let id = selectedProspecteurs[0].id;
      console.log(id);

      const url = `${ip}suppression-prospector`;
      const headers = { "Content-Type": "application/json" };

      const dataIns = {
        id: id,
      };

      const confirmAndSendData = async () => {
        const userConfirmed = window.confirm(
          "Voulez-vous vraiment effectuer cette action ?"
        );

        if (userConfirmed) {
          try {
            const response = await axios.post(url, dataIns, { headers });

            if (response.status === 200) {
              console.log("Data sent successfully");
              showSuccess();
            } else {
              console.error("Failed to send data");
              showError();
            }
          } catch (error) {
            if (error.response && error.response.status === 409) {
              console.log("Conflict detected in catch block");
              showExistant();
            } else if (error.response && error.response.status === 500) {
              console.error("Server error in catch block");
              showError();
            }
          }
        } else {
          console.log("Action annulée par l'utilisateur");
        }
      };
      confirmAndSendData();
    } else {
      console.warn("Aucune ligne sélectionnée pour la suppression.");
    }
  };

  const handleClick = (event, id) => {
    const isAlreadySelected = selected.includes(id);

    if (isAlreadySelected) {
      setSelected([]);
    } else {
      setSelected([id]);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - projet.length) : 0;
  const visibleRows = React.useMemo(() => {
    const filteredProspecteurs = stableSort(
      projet,
      getComparator(order, orderBy)
    ).filter((projet) => {
      const searchLower = searchValue.toLowerCase();
      const nomProjetMatch = projet.nomProjet
        .toLowerCase()
        .includes(searchLower);
      const typeProjetMatch = projet.typeProjet
        .toLowerCase()
        .includes(searchLower);
      const dateCreationMatch = projet.dateCreation
        .toLowerCase()
        .includes(searchLower);

      // Utilisez une logique OR pour inclure les lignes correspondant à l'un des critères
      return nomProjetMatch || typeProjetMatch || dateCreationMatch;
    });

    return filteredProspecteurs.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [order, orderBy, page, rowsPerPage, projet, searchValue]);

  useEffect(() => {
    const fetchProjet = async () => {
      try {
        const cachedToken = sessionStorage.getItem("token");

        if (cachedToken) {
          const headers = { Authorization: `Bearer ${cachedToken}` };
          const response = await axios.get(`${ip}all-project/${cachedToken}`, {
            headers,
          });

          if (response.status === 200) {
            setProjet(response.data);
          } else {
            throw new Error("Failed to load data");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
    fetchProjet();
  }, [projet]);

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          onSearch={setSearchValue}
        />
        <TableContainer>
          <Table sx={{ minWidth: 750 }} size={dense ? "small" : "medium"}>
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={projet.length}
            />
            <TableBody onClick={handleOutsideClick}>
              {visibleRows.map((projet, index) => {
                const isItemSelected = isSelected(projet.idProjet);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, projet.idProjet)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={projet.id}
                    selected={isItemSelected}
                    sx={{ cursor: "pointer" }}
                    onContextMenu={(event) =>
                      handleContextMenu(event, projet.idProjet)
                    }
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="normal"
                    >
                      {projet.idProjet}
                    </TableCell>
                    <TableCell align="left">{projet.nomProjet}</TableCell>
                    <TableCell align="left">{projet.typeProjet}</TableCell>
                    <TableCell align="left">{formaterDate(projet.dateCreation)}</TableCell>
                    <TableCell align="left">0%</TableCell>

                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            <Menu model={menuItems} popup ref={menuRef} />
            <QuestionnaireDialog
              projectId={selectedItemId}
              visible={dialogVisible}
              onHide={hideProjectDialog}
            />
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={projet.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Densité des lignes"
      />
      <Toast ref={toast} />
    </Box>
  );
}
