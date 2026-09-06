classdef Slice_To_SliceLayer1000 < nnet.layer.Layer & nnet.layer.Formattable
    % A custom layer auto-generated while importing an ONNX network.
    %#codegen

    %#ok<*PROPLC>
    %#ok<*NBRAK>
    %#ok<*INUSL>
    %#ok<*VARARG>
    properties (Learnable)
    end

    properties (State)
    end

    properties
        Vars
        NumDims
    end

    methods(Static, Hidden)
        % Specify the properties of the class that will not be modified
        % after the first assignment.
        function p = matlabCodegenNontunableProperties(~)
            p = {
                % Constants, i.e., Vars, NumDims and all learnables and states
                'Vars'
                'NumDims'
                };
        end
    end


    methods(Static, Hidden)
        % Instantiate a codegenable layer instance from a MATLAB layer instance
        function this_cg = matlabCodegenToRedirected(mlInstance)
            this_cg = backbone.coder.Slice_To_SliceLayer1000(mlInstance);
        end
        function this_ml = matlabCodegenFromRedirected(cgInstance)
            this_ml = backbone.Slice_To_SliceLayer1000(cgInstance.Name);
            if isstruct(cgInstance.Vars)
                names = fieldnames(cgInstance.Vars);
                for i=1:numel(names)
                    fieldname = names{i};
                    this_ml.Vars.(fieldname) = dlarray(cgInstance.Vars.(fieldname));
                end
            else
                this_ml.Vars = [];
            end
            this_ml.NumDims = cgInstance.NumDims;
        end
    end

    methods
        function this = Slice_To_SliceLayer1000(mlInstance)
            this.Name = mlInstance.Name;
            this.OutputNames = {'onnx__Add_343'};
            if isstruct(mlInstance.Vars)
                names = fieldnames(mlInstance.Vars);
                for i=1:numel(names)
                    fieldname = names{i};
                    this.Vars.(fieldname) = backbone.coder.ops.extractIfDlarray(mlInstance.Vars.(fieldname));
                end
            else
                this.Vars = [];
            end

            this.NumDims = mlInstance.NumDims;
        end

        function [onnx__Add_343] = predict(this, onnx__Slice_544__)
            if isdlarray(onnx__Slice_544__)
                onnx__Slice_544_ = stripdims(onnx__Slice_544__);
            else
                onnx__Slice_544_ = onnx__Slice_544__;
            end
            onnx__Slice_544NumDims = 4;
            onnx__Slice_544 = backbone.coder.ops.permuteInputVar(onnx__Slice_544_, [4 3 1 2], 4);

            [onnx__Add_343__, onnx__Add_343NumDims__] = Slice_To_SliceGraph1000(this, onnx__Slice_544, onnx__Slice_544NumDims, false);
            onnx__Add_343_ = backbone.coder.ops.permuteOutputVar(onnx__Add_343__, [3 4 2 1], 4);

            onnx__Add_343 = dlarray(single(onnx__Add_343_), 'SSCB');
        end

        function [onnx__Add_343, onnx__Add_343NumDims1001] = Slice_To_SliceGraph1000(this, onnx__Slice_544, onnx__Slice_544NumDims, Training)

            % Execute the operators:
            % Slice:
            [indices1000, onnx__Slice_338NumDims] = backbone.coder.ops.prepareSliceArgs(onnx__Slice_544, this.Vars.onnx__Slice_335, this.Vars.onnx__Slice_336, this.Vars.onnx__Slice_334, this.Vars.onnx__Slice_337, coder.const(onnx__Slice_544NumDims));
            onnx__Slice_338 = onnx__Slice_544(indices1000{:});

            % Slice:
            [indices1001, onnx__Add_343NumDims] = backbone.coder.ops.prepareSliceArgs(onnx__Slice_338, this.Vars.onnx__Slice_340, this.Vars.onnx__Slice_341, this.Vars.onnx__Slice_339, this.Vars.onnx__Slice_342, coder.const(onnx__Slice_338NumDims));
            onnx__Add_343 = onnx__Slice_338(indices1001{:});

            % Set graph output arguments
            onnx__Add_343NumDims1001 = coder.const(onnx__Add_343NumDims);

        end

    end

end